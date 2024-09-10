import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Find the customer by email
    const customers = await stripe.customers.list({ email: email });
    if (customers.data.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const customer = customers.data[0];

    // Find active subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Cancel the first active subscription
    const subscription = await stripe.subscriptions.cancel(subscriptions.data[0].id);

    return NextResponse.json({ subscription });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Error canceling subscription', details: err.message },
      { status: 500 }
    );
  }
}
