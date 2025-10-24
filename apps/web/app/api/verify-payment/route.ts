import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
  hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
  const expected = hmac.digest('hex');
  const success = expected === razorpay_signature;
  return NextResponse.json({ success });
}
