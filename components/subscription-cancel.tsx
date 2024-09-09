'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscriptionCancelClient() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push('/');
    }, 5000);
  }, [router]);

  return (
    <div>
      <h1>Subscription Cancelled</h1>
      <p>You will be redirected to the main page in 5 seconds...</p>
    </div>
  );
}