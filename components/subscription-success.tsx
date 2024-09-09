'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscriptionSuccessClient() {
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem('subscriptionStatus', 'active');
    setTimeout(() => {
      router.push('/');
    }, 3000);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Subscription Successful</h1>
      <p className="text-sm text-muted-foreground">You will be redirected back to Briefcase in a few seconds...</p>
    </div>
  );
}