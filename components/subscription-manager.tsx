"use client";

import { useI18n } from "@quetzallabs/i18n";
import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { Switch } from "./ui/switch";
import { MouseEvent } from 'react';
import { Loader2 } from "lucide-react"; // Make sure to import this

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface SubscriptionManagerProps {
  onSubscriptionChange: (isSubscribed: boolean) => void;
  isSubscribed: boolean;
  onActionClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

export default function SubscriptionManager({
  onSubscriptionChange,
  isSubscribed: initialIsSubscribed,
  onActionClick,
}: SubscriptionManagerProps) {
  const { t } = useI18n();
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [email, setEmail] = useState("");
  const [isCheckingMode, setIsCheckingMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const logState = useCallback(() => {
    console.log("SubscriptionManager state:", {
      isSubscribed,
      email,
      isCheckingMode,
      isLoading,
      localStorageSubscriptionStatus: localStorage.getItem("subscriptionStatus"),
      localStorageUserEmail: localStorage.getItem("userEmail"),
    });
  }, [isSubscribed, email, isCheckingMode, isLoading]);

  useEffect(() => {
    const subscriptionStatus = localStorage.getItem("subscriptionStatus");
    const subscribedEmail = localStorage.getItem("userEmail");
    const newSubscriptionStatus = subscriptionStatus === "active";
    
    console.log("SubscriptionManager initial load:", {
      subscriptionStatus,
      subscribedEmail,
      newSubscriptionStatus,
    });

    setIsSubscribed(newSubscriptionStatus);
    if (subscribedEmail) {
      setEmail(subscribedEmail);
    }
    onSubscriptionChange(newSubscriptionStatus);

    logState();
  }, [onSubscriptionChange, logState]);

  const handleSubscribe = async () => {
    console.log("handleSubscribe called with email:", email);
    setIsLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const { sessionId } = await response.json();
      console.log("Received sessionId from create-checkout-session:", sessionId);

      localStorage.setItem("userEmail", email);
      console.log("Stored userEmail in localStorage:", email);

      const stripe = await stripePromise;
      console.log("Redirecting to Stripe checkout...");
      const { error } = await stripe!.redirectToCheckout({
        sessionId,
      });
      if (error) {
        console.error("Stripe redirectToCheckout error:", error);
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
    } finally {
      setIsLoading(false);
      logState();
    }
  };

  const handleCheckSubscription = async () => {
    console.log("handleCheckSubscription called with email:", email);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/verify-subscription?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      console.log("Subscription verification response:", data);
      if (data.isSubscribed) {
        localStorage.setItem("userEmail", email);
        localStorage.setItem("subscriptionStatus", "active");
        setIsSubscribed(true);
        onSubscriptionChange(true);
        console.log("Subscription verified and state updated");
      } else {
        console.log("No active subscription found");
        localStorage.setItem("subscriptionStatus", "inactive");
        toast({
          description: t("No active subscription found for this email."),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      toast({
        description: t("Error checking subscription. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    console.log("handleUnsubscribe called with email:", email);
    setIsLoading(true);
    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const responseData = await response.json();
      console.log("Cancel subscription response:", responseData);
      if (!response.ok) {
        throw new Error(`Failed to cancel subscription: ${responseData.error}`);
      }
      if (responseData.subscription.status === "canceled") {
        localStorage.removeItem("userEmail");
        localStorage.setItem("subscriptionStatus", "inactive");
        setIsSubscribed(false);
        onSubscriptionChange(false);
        console.log("Subscription canceled and state updated");
      } else {
        console.error("Unexpected cancellation status:", responseData.subscription.status);
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-2">
        <Input
          type="email"
          placeholder={t("Enter your email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-grow"
          disabled={isSubscribed}
        />
        <div className="w-2" />
        <Button
          className="w-28"
          onClick={(e) => {
            onActionClick(e);
            if (isSubscribed) {
              handleUnsubscribe();
            } else {
              isCheckingMode ? handleCheckSubscription() : handleSubscribe();
            }
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isSubscribed ? (
            t("Cancel")
          ) : isCheckingMode ? (
            t("Check")
          ) : (
            t("Upgrade")
          )}
        </Button>
      </div>
      <div className="text-muted-foreground text-sm">
        {isSubscribed ? (
          <p>
            {t("You currently have unlimited access through your Pro subscription.")}
          </p>
        ) : isCheckingMode ? (
          <p className="text-xs">
            {t("Enter the email you used to subscribe. ")}
            <a
              href="#"
              className="text-[#3675F1] hover:text-[#2556E4] font-bold"
              onClick={(e) => {
                e.preventDefault();
                setIsCheckingMode(false);
              }}
            >
              {t("Need a new subscription?")}
            </a>
          </p>
        ) : (
          <p className="text-xs">
            {t("Enter an email to use for your subscription. ")}
            <a
              href="#"
              className="text-[#3675F1] hover:text-[#2556E4] font-bold"
              onClick={(e) => {
                e.preventDefault();
                setIsCheckingMode(true);
              }}
            >
              {t("Already have a subscription?")}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
