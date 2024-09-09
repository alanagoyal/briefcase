'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscriptionSuccessClient({ session_id }: { session_id: string }) {
  const router = useRouter();

  useEffect(() => {
    if (session_id) {
      localStorage.setItem('subscriptionStatus', 'active');
      localStorage.setItem('sessionId', session_id);
    } else {
      console.error('No session_id provided');
    }
    setTimeout(() => {
      router.push('/');
    }, 3000);
  }, [router, session_id]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Subscription Successful</h1>
      <p className="text-sm text-muted-foreground">You will be redirected back to Briefcase in a few seconds...</p>
    </div>
  );
}