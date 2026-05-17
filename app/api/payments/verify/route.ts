import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { auth } from '@/auth';
import { validateRequest } from '@/lib/validate';
import { errorResponse, ApiError } from '@/lib/api-error';
import { query, dbPool } from '@/lib/db';

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const validation = await validateRequest(req, verifySchema);
  if (!validation.success) return validation.response;

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    validation.data;

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new ApiError(
      'Server misconfiguration',
      'MISSING_RAZORPAY_SECRET',
      500
    );
  }

  // Verify signature — Razorpay signs "order_id|payment_id" with key_secret
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError('Invalid payment signature', 'INVALID_SIGNATURE', 400);
  }

  try {
    // Get the order
    const orderResult = await query(
      `SELECT id, user_id, plan, billing_cycle, amount, status FROM orders WHERE razorpay_order_id = $1`,
      [razorpay_order_id]
    );

    const order = orderResult.rows[0];
    if (!order) {
      throw new ApiError('Order not found', 'ORDER_NOT_FOUND', 404);
    }

    if (order.user_id !== session.user.id) {
      throw new ApiError('Order does not belong to user', 'FORBIDDEN', 403);
    }

    if (order.status === 'paid') {
      return NextResponse.json({ success: true, message: 'Already paid' });
    }

    // Get a dedicated client from the pool for a transaction
    const client = await dbPool.connect();
    try {
      await client.query('BEGIN');

      // Update order status
      await client.query(`UPDATE orders SET status = 'paid' WHERE id = $1`, [
        order.id,
      ]);

      // Insert payment record
      await client.query(
        `INSERT INTO payments (order_id, user_id, razorpay_payment_id, razorpay_signature, amount, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          order.id,
          session.user.id,
          razorpay_payment_id,
          razorpay_signature,
          order.amount,
          'captured',
        ]
      );

      // Calculate subscription end date
      const startDate = new Date();
      const endDate = new Date(startDate);
      if (order.billing_cycle === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Upsert subscription
      await client.query(
        `INSERT INTO user_subscriptions (user_id, plan, billing_cycle, status, start_date, end_date, razorpay_order_id)
         VALUES ($1, $2, $3, 'active', $4, $5, $6)
         ON CONFLICT (user_id) DO UPDATE SET
           plan = EXCLUDED.plan,
           billing_cycle = EXCLUDED.billing_cycle,
           status = 'active',
           start_date = EXCLUDED.start_date,
           end_date = EXCLUDED.end_date,
           razorpay_order_id = EXCLUDED.razorpay_order_id,
           updated_at = NOW()`,
        [
          session.user.id,
          order.plan,
          order.billing_cycle,
          startDate,
          endDate,
          razorpay_order_id,
        ]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return NextResponse.json({
      success: true,
      plan: order.plan,
      billingCycle: order.billing_cycle,
    });
  } catch (error) {
    return errorResponse(error, 'verify-payment');
  }
}
