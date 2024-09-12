"use client";

import { useI18n } from "@quetzallabs/i18n";
import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { toast } from "./ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Info, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import SubscriptionManager from "@/components/subscription-manager";
import { MouseEvent } from "react";
import { Settings, Sliders } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useTheme } from "next-themes";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNameChange: (name: string) => void;
  onApiKeyChange: (apiKey: string) => void;
  isSubscribed: boolean;
  onSubscriptionChange: (isSubscribed: boolean) => void;
}

export default function SettingsDialog({
  open,
  onOpenChange,
  onNameChange,
  onApiKeyChange,
  isSubscribed,
  onSubscriptionChange,
}: SettingsDialogProps) {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [initialApiKey, setInitialApiKey] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newUser, setNewUser] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    setIsClient(true);
    const storedName = localStorage.getItem("userName");
    const storedApiKey = localStorage.getItem("openaiApiKey");
    setNewUser(!storedName);
    if (storedName) {
      setName(storedName);
    }
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setInitialApiKey(storedApiKey);
    }
  }, [open]);

  const handleCloseAttempt = (newOpen: boolean) => {
    if (!newOpen) {
      if (name.trim()) {
        localStorage.setItem("userName", name.trim());
        onNameChange(name.trim());
        onOpenChange(false);
      } else if (newUser) {
        toast({
          description: t("Please enter a name before closing"),
          variant: "destructive",
        });
      } else {
        onOpenChange(false);
      }
    } else {
      onOpenChange(true);
    }
  };

  const handleSubscriptionAction = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Validate API key
  const validateApiKey = async (apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/validate-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.valid;
      }
      return false;
    } catch (error) {
      console.error("Error validating API key:", error);
      return false;
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem("userName", name);
      setNewUser(false);

      // Check if the API key has changed
      if (apiKey !== initialApiKey) {
        if (apiKey) {
          setIsLoading(true);
          const isValid = await validateApiKey(apiKey);
          setIsLoading(false);
          if (isValid) {
            localStorage.setItem("openaiApiKey", apiKey);
            onApiKeyChange(apiKey);
            toast({
              description: t("Settings saved successfully"),
            });
            onOpenChange(false);
          } else {
            toast({
              description: t("Invalid API key. Please check and try again."),
              variant: "destructive",
            });
            return; // Don't close the dialog if the API key is invalid
          }
        } else {
          // API key is being removed
          localStorage.removeItem("openaiApiKey");
          onApiKeyChange("");
        }
      }
      onNameChange(name);
      toast({
        description: t("Settings saved successfully"),
      });
      onOpenChange(false);
    } else {
      toast({
        description: t("Please enter a name"),
        variant: "destructive",
      });
    }
  };
  if (!isClient) {
    return null;
  }
  return (
    <Dialog open={open} onOpenChange={handleCloseAttempt}>
      <DialogContent className="sm:max-w-2xl p-0" showCloseButton={!newUser}>
        <DialogHeader className="p-6 border-b">
          <DialogTitle>{newUser ? t("Briefcase") : t("Settings")}</DialogTitle>
          <DialogDescription>
            {newUser
              ? t(
                  "The AI legal assistant for fast-moving founders and investors"
                )
              : t("Update your information below")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex">
          <nav className="w-1/4 p-4 space-y-2 text-sm">
            {[
              { icon: Settings, label: "General" },
              { icon: Sliders, label: "Advanced" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                className={`flex items-center space-x-2 w-full p-2 rounded-lg text-left ${
                  activeTab === label.toLowerCase()
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => setActiveTab(label.toLowerCase())}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <div className="w-3/4 px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === "general" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("Name")}</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                      className="sm:text-sm text-base"
                      placeholder={t("Enter your name")}
                      required
                    />
                    {newUser && (
                      <p className="text-muted-foreground text-xs">
                        {t(
                          "Your name will only be used for your avatar in the chat. It will not be stored anywhere."
                        )}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="theme" className="text-sm font-medium">
                      Theme
                    </label>
                    <Select
                      value={theme}
                      onValueChange={(value) => setTheme(value)}
                    >
                      <SelectTrigger id="theme" className="w-full">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="language" className="text-sm font-medium">
                      Language
                    </label>
                    <Select defaultValue="auto">
                      <SelectTrigger id="language" className="w-full">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-detect</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {activeTab === "advanced" && (
                <>
                  {!newUser && (
                    <SubscriptionManager
                      isSubscribed={isSubscribed}
                      onSubscriptionChange={onSubscriptionChange}
                      onActionClick={handleSubscriptionAction}
                    />
                  )}
                  {!newUser && !isSubscribed && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="apiKey">{t("OpenAI API Key")}</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent side="right" align="center">
                              <p className="max-w-[300px]">
                                {t(
                                  "Your API key is not stored and is only used to authenticate your requests to the OpenAI API."
                                )}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id="apiKey"
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                        }}
                        type="password"
                        placeholder={t("Enter your OpenAI API Key")}
                      />
                      <p className="text-muted-foreground text-xs">
                        {t(
                          "Briefcase has a limit of 10 messages per day. For unlimited access, please enter your OpenAI Key."
                        )}
                      </p>
                    </div>
                  )}
                </>
              )}
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-[#3675F1] hover:bg-[#2556E4] w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    </>
                  ) : newUser ? (
                    t("Start Chatting")
                  ) : (
                    t("Save Settings")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
