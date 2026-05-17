import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/db';
import logger from '@/lib/logger';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error('RAZORPAY_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  if (expectedSignature !== signature) {
    logger.warn('Invalid Razorpay webhook signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { event: eventType, payload } = event;

  try {
    switch (eventType) {
      case 'payment.captured': {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;
        const paymentId = payment.id;
        const amount = payment.amount;
        const method = payment.method;

        logger.info({ orderId, paymentId }, 'Payment captured via webhook');

        // Update order status
        await query(
          `UPDATE orders SET status = 'paid' WHERE razorpay_order_id = $1 AND status = 'created'`,
          [orderId]
        );

        // Insert payment if not exists
        await query(
          `INSERT INTO payments (order_id, user_id, razorpay_payment_id, razorpay_signature, amount, method, status)
           SELECT o.id, o.user_id, $2, '', $3, $4, 'captured'
           FROM orders o WHERE o.razorpay_order_id = $1
           ON CONFLICT (razorpay_payment_id) DO NOTHING`,
          [orderId, paymentId, amount, method]
        );
        break;
      }

      case 'payment.failed': {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;

        logger.warn({ orderId }, 'Payment failed via webhook');

        await query(
          `UPDATE orders SET status = 'failed' WHERE razorpay_order_id = $1`,
          [orderId]
        );
        break;
      }

      case 'refund.processed': {
        const refund = payload.refund.entity;
        const paymentId = refund.payment_id;

        logger.info({ paymentId }, 'Refund processed via webhook');

        // Find the order through the payment
        const paymentResult = await query(
          `SELECT order_id FROM payments WHERE razorpay_payment_id = $1`,
          [paymentId]
        );

        if (paymentResult.rows[0]) {
          const orderId = paymentResult.rows[0].order_id;
          await query(`UPDATE orders SET status = 'refunded' WHERE id = $1`, [
            orderId,
          ]);
          await query(
            `UPDATE payments SET status = 'refunded' WHERE razorpay_payment_id = $1`,
            [paymentId]
          );
        }
        break;
      }

      default:
        logger.info({ eventType }, 'Unhandled Razorpay webhook event');
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    logger.error({ error, eventType }, 'Error processing Razorpay webhook');
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
