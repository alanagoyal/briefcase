'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscriptionSuccessClient() {
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem('subscriptionStatus', 'active');
    setTimeout(() => {
      router.push('/');
    }, 5000);
  }, [router]);

  return (
    <div>
      <h1>Subscription Successful!</h1>
      <p>You will be redirected to the main page in 5 seconds...</p>
    </div>
  );
}