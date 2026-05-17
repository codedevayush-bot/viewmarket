import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { validateRequest } from '@/lib/validate';
import { errorResponse, ApiError } from '@/lib/api-error';
import { query } from '@/lib/db';
import { getRazorpay } from '@/lib/razorpay';

const planPrices: Record<string, Record<string, number>> = {
  Starter: { monthly: 999, yearly: 799 },
  Pro: { monthly: 2500, yearly: 2000 },
  Premium: { monthly: 4500, yearly: 3600 },
};

const createOrderSchema = z.object({
  plan: z.enum(['Starter', 'Pro', 'Premium']),
  billingCycle: z.enum(['monthly', 'yearly']),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const validation = await validateRequest(req, createOrderSchema);
  if (!validation.success) return validation.response;

  const { plan, billingCycle } = validation.data;

  const amountInRupees = planPrices[plan]?.[billingCycle];
  if (!amountInRupees) {
    throw new ApiError('Invalid plan or billing cycle', 'INVALID_PLAN', 400);
  }

  const amountInPaise = amountInRupees * 100;
  const receipt = `vm_${session.user.id.slice(0, 8)}_${Date.now()}`;

  try {
    const razorpayInstance = getRazorpay();
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        userId: session.user.id,
        plan,
        billingCycle,
      },
    });

    await query(
      `INSERT INTO orders (user_id, razorpay_order_id, plan, billing_cycle, amount, currency, status, receipt)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        session.user.id,
        razorpayOrder.id,
        plan,
        billingCycle,
        amountInPaise,
        'INR',
        'created',
        receipt,
      ]
    );

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return errorResponse(error, 'create-order');
  }
}
