import Razorpay from 'razorpay';

export function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID!;
  const key_secret = process.env.RAZORPAY_KEY_SECRET!;
  return new Razorpay({ key_id, key_secret });
}
