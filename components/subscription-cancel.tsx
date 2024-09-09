"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionCancelClient() {
  const router = useRouter();

  useEffect(() => {
    // Clear subscription data from localStorage
    localStorage.removeItem("subscriptionStatus");
    localStorage.removeItem("sessionId");

    setTimeout(() => {
      router.push("/");
    }, 3000);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Subscription Cancelled</h1>
      <p className="text-sm text-muted-foreground">
        You will be redirected back to Briefcase in a few seconds...
      </p>
    </div>
  );
}
