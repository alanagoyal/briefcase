'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SubscriptionManagerProps {
  onSubscriptionChange: (isSubscribed: boolean) => void;
  isSubscribed: boolean;
}

export function SubscriptionManager({ onSubscriptionChange, isSubscribed: initialIsSubscribed }: SubscriptionManagerProps) {
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const storedSessionId = localStorage.getItem('sessionId');
    const subscriptionStatus = localStorage.getItem('subscriptionStatus');
    const newSubscriptionStatus = subscriptionStatus === 'active';
    setIsSubscribed(newSubscriptionStatus);
    setSessionId(storedSessionId);
    onSubscriptionChange(newSubscriptionStatus);
  }, [onSubscriptionChange]);

  const handleSubscribe = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Error:', error);
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
    }
  };

  const handleUnsubscribe = async () => {
    if (!sessionId) {
      console.error('No session ID found');
      return;
    }

    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Server response:', responseData);
        throw new Error(`Failed to cancel subscription: ${responseData.error}`);
      }

      if (responseData.subscription.status === 'canceled') {
        localStorage.setItem('subscriptionStatus', 'inactive');
        localStorage.removeItem('sessionId');
        setIsSubscribed(false);
        setSessionId(null);
        onSubscriptionChange(false);
      } else {
        console.error('Unexpected cancellation status:', responseData.subscription.status);
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
  };

  return (
    <div>
      {isSubscribed ? (
        <p className="text-muted-foreground text-sm">
          {`You have unlimited access with your Pro subscription. You may `}
          <a href="#" className="text-primary text-[#0070f3] text-sm font-bold" onClick={(e) => { e.preventDefault(); handleUnsubscribe(); }}>
          cancel your subscription
        </a> {` at any time.`}
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">
          <a href="#" className="text-primary text-[#0070f3] text-sm font-bold" onClick={(e) => { e.preventDefault(); handleSubscribe(); }}>
            Upgrade to Pro
          </a>
          {' for access to unlimited messages and advanced features.'}
        </p>
      )}
    </div>
  );
}