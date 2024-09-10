import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { sessionId } = await request.json();

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.subscription) {
      return NextResponse.json(
        { error: "No subscription found for this session" },
        { status: 400 }
      );
    }

    const canceledSubscription = await stripe.subscriptions.cancel(
      session.subscription as string
    );

    return NextResponse.json({
      success: true,
      subscription: canceledSubscription,
    });
  } catch (error) {
    console.error("Error in cancel-subscription route:", error);
    return NextResponse.json(
      {
        error: "Error canceling subscription",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
