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

  useEffect(() => {
    const subscriptionStatus = localStorage.getItem('subscriptionStatus');
    const newSubscriptionStatus = subscriptionStatus === 'active';
    setIsSubscribed(newSubscriptionStatus);
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

  const handleUnsubscribe = () => {
    localStorage.setItem('subscriptionStatus', 'inactive');
    setIsSubscribed(false);
    onSubscriptionChange(false);
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