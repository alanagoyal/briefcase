"use client";

import { useI18n } from "@quetzallabs/i18n";
import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { MouseEvent } from "react";
import { Info, Loader2 } from "lucide-react";
import { Label } from "./ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

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
  const [isVerifying, setIsVerifying] = useState(false);

  const verifySubscription = useCallback(
    async (email: string) => {
      if (!email) return;
      setIsVerifying(true);
      try {
        const response = await fetch(
          `/api/verify-subscription?email=${encodeURIComponent(email)}`
        );
        const data = await response.json();
        setIsSubscribed(data.isSubscribed);
        onSubscriptionChange(data.isSubscribed);
        localStorage.setItem(
          "subscriptionStatus",
          data.isSubscribed ? "active" : "inactive"
        );
      } catch (error) {
        console.error("Error verifying subscription:", error);
      } finally {
        setIsVerifying(false);
      }
    },
    [onSubscriptionChange]
  );

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      verifySubscription(storedEmail);
    }
  }, [verifySubscription]);

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

      localStorage.setItem("userEmail", email);

      const stripe = await stripePromise;
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
    }
  };

  const handleCheckSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/verify-subscription?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();
      if (data.isSubscribed) {
        localStorage.setItem("userEmail", email);
        localStorage.setItem("subscriptionStatus", "active");
        setIsSubscribed(true);
        onSubscriptionChange(true);
      } else {
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
      if (!response.ok) {
        throw new Error(`Failed to cancel subscription: ${responseData.error}`);
      }
      if (responseData.subscription.status === "canceled") {
        localStorage.removeItem("userEmail");
        localStorage.setItem("subscriptionStatus", "inactive");
        setIsSubscribed(false);
        onSubscriptionChange(false);
      } else {
        console.error(
          "Unexpected cancellation status:",
          responseData.subscription.status
        );
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Label>{t("Subscription")}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              <p className="max-w-[300px]">
                {t(
                  "Your subscription is linked to this email and can be accessed from any device for unlimited messages."
                )}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
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
          className="w-32"
          onClick={(e) => {
            onActionClick(e);
            if (isSubscribed) {
              handleUnsubscribe();
            } else {
              isCheckingMode ? handleCheckSubscription() : handleSubscribe();
            }
          }}
          disabled={isLoading || (!isSubscribed && !email)}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isSubscribed ? (
            t("Cancel")
          ) : isCheckingMode ? (
            t("Verify")
          ) : (
            t("Upgrade")
          )}
        </Button>
      </div>
      <div className="text-muted-foreground text-sm">
        {isSubscribed ? (
          <p>
            {t(
              "You currently have unlimited access through your Pro subscription."
            )}
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
