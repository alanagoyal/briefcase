"use client";

import { useI18n } from "@quetzallabs/i18n";
import { useState, useEffect, useCallback } from "react";
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
import { Info, Loader2, User, Sliders } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import SubscriptionManager from "@/components/subscription-manager";
import { MouseEvent } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNameChange: (name: string) => void;
  onApiKeyChange: (apiKey: string) => void;
  isSubscribed: boolean;
  onSubscriptionChange: (isSubscribed: boolean) => void;
  initialTab?: string;
  onDeleteAllConversations: () => void;
}

export default function SettingsDialog({
  open,
  onOpenChange,
  onNameChange,
  onApiKeyChange,
  isSubscribed,
  onSubscriptionChange,
  initialTab = "general",
  onDeleteAllConversations,
}: SettingsDialogProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [initialApiKey, setInitialApiKey] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newUser, setNewUser] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const [language, setLanguage] = useState("auto");
  const { theme, setTheme } = useTheme();
  const [isApiKeyValidated, setIsApiKeyValidated] = useState(false);

  const COOKIE_NAME = "NEXT_LOCALE";
  const setLocaleCookie = (locale: string) => {
    document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  };
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    localStorage.setItem("userLanguage", value);
    if (value === "fr") {
      setLocaleCookie("fr-FR");
      router.refresh();
    } else if (value === "en") {
      setLocaleCookie("en-US");
      router.refresh();
    } else {
      // For "auto", remove the cookie and use the default locale
      document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      router.refresh();
    }
  };

  useEffect(() => {
    setIsClient(true);
    const storedName = localStorage.getItem("userName");
    const storedApiKey = localStorage.getItem("openaiApiKey");
    const storedLanguage = localStorage.getItem("userLanguage");
    setNewUser(!storedName);
    if (storedName) {
      setName(storedName);
    }
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setInitialApiKey(storedApiKey);
      setIsApiKeyValidated(true);
    }
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
    setActiveTab(initialTab);
  }, [open, initialTab]);

  const handleCloseAttempt = async (newOpen: boolean) => {
    if (!newOpen) {
      if (name.trim()) {
        localStorage.setItem("userName", name.trim());
        onNameChange(name.trim());

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

  const handleApiKeyValidation = useCallback(async () => {
    setIsLoading(true);
    const isValid = await validateApiKey(apiKey);
    setIsLoading(false);
    if (isValid) {
      localStorage.setItem("openaiApiKey", apiKey);
      onApiKeyChange(apiKey);
      setIsApiKeyValidated(true);
      toast({
        description: t("API key applied successfully"),
      });
    } else {
      toast({
        description: t("Invalid API key. Please check and try again."),
        variant: "destructive",
      });
    }
  }, [apiKey, onApiKeyChange, t]);

  const handleApiKeyRemoval = useCallback(() => {
    localStorage.removeItem("openaiApiKey");
    onApiKeyChange("");
    setApiKey("");
    setIsApiKeyValidated(false);
    toast({
      description: t("API key removed successfully"),
    });
  }, [onApiKeyChange, t]);

  if (!isClient) {
    return null;
  }
  const TabButton = ({
    value,
    label,
    icon: Icon,
  }: {
    value: string;
    label: string;
    icon: React.ElementType;
  }) => (
    <button
      className={`text-left px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm ${
        activeTab === value ? "bg-muted" : "hover:bg-muted/50"
      } sm:w-full`}
      onClick={() => setActiveTab(value)}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{t(label)}</span>
    </button>
  );
  return (
    <Dialog open={open} onOpenChange={handleCloseAttempt}>
      <DialogContent
        className={`${newUser ? "sm:max-w-xl" : "sm:max-w-2xl"}`}
        showCloseButton={!newUser}
      >
        <DialogHeader>
          <DialogTitle>{newUser ? t("Briefcase") : t("Settings")}</DialogTitle>
          <DialogDescription>
            {newUser
              ? t(
                  "The AI legal assistant for fast-moving founders and investors"
                )
              : t("Update your information below")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {newUser ? (
            // Existing new user form
            <div className="space-y-2">
              <Label htmlFor="name">{t("Name")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="sm:text-sm text-base"
                placeholder={t("Enter your name")}
                required
              />
              <p className="text-muted-foreground text-xs">
                {t(
                  "Your name will only be used for your avatar in the chat. It will not be stored anywhere."
                )}
              </p>
            </div>
          ) : (
            // Side navigation for existing users
            <div className="flex space-x-4 h-[265px]">
              {/* Set a fixed height */}
              <nav className="w-1/4 space-y-2">
                <TabButton value="general" label={t("General")} icon={User} />
                <TabButton
                  value="advanced"
                  label={t("Advanced")}
                  icon={Sliders}
                />
              </nav>
              <div className="w-3/4 overflow-y-auto px-2">
                {/* Add overflow-y-auto */}
                <div className="space-y-4">
                  {activeTab === "general" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">{t("Name")}</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="sm:text-sm text-base"
                          placeholder={t("Enter your name")}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="theme" className="text-sm font-medium">
                          {t("Theme")}
                        </Label>
                        <Select
                          value={theme}
                          onValueChange={(value) => setTheme(value)}
                        >
                          <SelectTrigger id="theme" className="w-full">
                            <SelectValue placeholder={t("Select theme")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">{t("Light")}</SelectItem>
                            <SelectItem value="dark">{t("Dark")}</SelectItem>
                            <SelectItem value="system">
                              {t("System")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="language"
                          className="text-sm font-medium"
                        >
                          {t("Language")}
                        </Label>
                        <Select
                          value={language}
                          onValueChange={handleLanguageChange}
                        >
                          <SelectTrigger id="language" className="w-full">
                            <SelectValue placeholder={t("Select language")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">
                              {t("Auto-detect")}
                            </SelectItem>
                            <SelectItem value="en">{t("English")}</SelectItem>
                            <SelectItem value="fr">{t("French")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  {activeTab === "advanced" && (
                    <>
                      {isSubscribed ? (
                        <div className="text-sm text-muted-foreground px-4 py-2 w-full bg-muted rounded-md">
                          {t(
                            "You currently have unlimited messages with your Pro Plan. You can cancel at anytime below."
                          )}
                        </div>
                      ) : isApiKeyValidated ? (
                        <div className="text-sm text-muted-foreground px-4 py-2 w-full bg-muted rounded-md">
                          {t(
                            "You currently have unlimited messages with your OpenAI API key. You can remove it at any time below."
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground px-4 py-2 w-full bg-muted rounded-md">
                          {t(
                            "Briefcase has a limit of 10 messages per user. To send more messages, please upgrade to the Pro Plan or set your OpenAI API key."
                          )}
                        </div>
                      )}
                      {!isApiKeyValidated && (
                        <SubscriptionManager
                          isSubscribed={isSubscribed}
                          onSubscriptionChange={onSubscriptionChange}
                          onActionClick={handleSubscriptionAction}
                        />
                      )}
                      {!isSubscribed && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="apiKey">
                              {t("OpenAI API Key")}
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent side="right" align="center">
                                  <p className="max-w-[300px]">
                                    {t(
                                      "Your API key will not be stored and is only used to authenticate your requests to the OpenAI API."
                                    )}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          {isApiKeyValidated ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                type="password"
                                value="••••••••••••••••••••••••••••••••"
                                disabled
                                className="flex-grow"
                              />
                              <Button
                                className="w-[100px] flex-shrink-0"
                                onClick={handleApiKeyRemoval}
                              >
                                {t("Remove")}
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Input
                                id="apiKey"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                type="password"
                                placeholder={t("Enter your OpenAI API Key")}
                                className="flex-grow"
                              />
                              <Button
                                className="w-[100px] flex-shrink-0"
                                onClick={handleApiKeyValidation}
                                disabled={isLoading || !apiKey}
                              >
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  t("Apply")
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                      {!newUser && (
                        <div className="flex flex-col space-y-2">
                          <Label>{t("Conversation History")}</Label>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-muted-foreground flex-grow pr-4">
                              {t(
                                "Delete all conversations and messages. This action cannot be undone."
                              )}
                            </p>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-[100px] flex-shrink-0">
                                  {t("Delete")}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {t("Delete Conversations")}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t(
                                      "This will permanently delete all of your conversations and messages. This action cannot be undone."
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="w-[100px] flex-shrink-0">{t("Cancel")}</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="w-[100px] flex-shrink-0"
                                    onClick={onDeleteAllConversations}
                                  >
                                    {t("Delete")}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          {newUser && (
            <DialogFooter>
              <Button
                type="button"
                className="bg-[#3675F1] hover:bg-[#2556E4] w-full"
                onClick={() => handleCloseAttempt(false)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  t("Start Chatting")
                )}
              </Button>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
