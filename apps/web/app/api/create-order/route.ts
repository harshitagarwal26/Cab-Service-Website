import { NextResponse } from 'next/server';
import { getRazorpay } from '@/lib/razorpay';

export async function POST(req: Request) {
  const { amount } = await req.json();
  const rz = getRazorpay();
  const order = await rz.orders.create({ amount, currency: 'INR' });
  return NextResponse.json({ orderId: order.id, amount, key: process.env.RAZORPAY_KEY_ID });
}
