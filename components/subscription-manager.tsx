"use client";

import { useI18n } from "@quetzallabs/i18n";
import { useState, useEffect } from "react";
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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isCheckingMode, setIsCheckingMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    const subscriptionStatus = localStorage.getItem("subscriptionStatus");
    const newSubscriptionStatus = subscriptionStatus === "active";
    setIsSubscribed(newSubscriptionStatus);
    setSessionId(storedSessionId);
    onSubscriptionChange(newSubscriptionStatus);
  }, [onSubscriptionChange]);

  const handleSubscribe = async () => {
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

      // Store the email before redirecting
      localStorage.setItem("subscribedEmail", email);

      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({
        sessionId,
      });
      if (error) {
        console.error("Error:", error);
        // If there's an error, we should remove the stored email
        localStorage.removeItem("subscribedEmail");
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      // If there's an error, we should remove the stored email
      localStorage.removeItem("subscribedEmail");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/create-checkout-session?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();
      if (data.isSubscribed) {
        localStorage.setItem("subscriptionStatus", "active");
        localStorage.setItem("subscribedEmail", email);
        setIsSubscribed(true);
        onSubscriptionChange(true);
      } else {
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
    if (!sessionId) {
      console.error("No session ID found");
      return;
    }
    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
        }),
      });
      const responseData = await response.json();
      if (!response.ok) {
        console.error("Server response:", responseData);
        throw new Error(
          `Failed to cancel subscription: ${responseData.error}${
            responseData.details ? ` - ${responseData.details}` : ""
          }`
        );
      }
      if (responseData.subscription.status === "canceled") {
        localStorage.setItem("subscriptionStatus", "inactive");
        localStorage.removeItem("sessionId");
        localStorage.removeItem("subscribedEmail");
        setIsSubscribed(false);
        setSessionId(null);
        onSubscriptionChange(false);
      } else {
        console.error(
          "Unexpected cancellation status:",
          responseData.subscription.status
        );
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
    }
  };

  return (
    <div>
      {isSubscribed ? (
        <p className="text-muted-foreground text-sm">
          {t("You have unlimited access with your Pro subscription. You may ")}
          <a
            href="#"
            className="text-[#3675F1] hover:text-[#2556E4] text-sm font-bold"
            onClick={(e) => {
              e.preventDefault();
              handleUnsubscribe();
            }}
          >
            {t("cancel your subscription")}
          </a>{" "}
          {t("at any time.")}
        </p>
      ) : (
        <div>
          <div className="flex items-center mb-2">
            <Input
              type="email"
              placeholder={t("Enter your email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow"
            />
            <div className="w-2" />
            <Button
              className="w-28" 
              onClick={(e) => {
                onActionClick(e);
                isCheckingMode ? handleCheckSubscription() : handleSubscribe();
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isCheckingMode ? (
                t("Check")
              ) : (
                t("Upgrade")
              )}
            </Button>
          </div>
          <div className="text-muted-foreground text-sm">
            {isCheckingMode ? (
              <p className="text-muted-foreground text-xs">
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
              <p className="text-muted-foreground text-xs">
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
      )}
    </div>
  );
}
