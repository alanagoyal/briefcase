"use client";

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

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNameChange: (name: string) => void;
  onApiKeyChange: (apiKey: string) => void;
}

export default function SettingsDialog({
  open,
  onOpenChange,
  onNameChange,
  onApiKeyChange,
}: SettingsDialogProps) {
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [initialApiKey, setInitialApiKey] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedName = localStorage.getItem("userName");
    const storedApiKey = localStorage.getItem("openaiApiKey");
    if (storedName) {
      setName(storedName);
    }
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setInitialApiKey(storedApiKey);
    }
  }, [open]);

  // Validate API key
  const validateApiKey = async (apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/validate-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
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
              description: "Settings saved successfully",
            });
            onOpenChange(false);
          } else {
            toast({
              description: "Invalid API key. Please check and try again.",
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
        description: "Settings saved successfully",
      });
      onOpenChange(false);
    } else {
      toast({
        description: "Please enter a name",
        variant: "destructive",
      });
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen: boolean) => {
      if (!newOpen && !name.trim()) {
        toast({
          description: "Please enter a name before closing",
          variant: "destructive",
        });
      } else {
        onOpenChange(newOpen);
      }
    }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{localStorage.getItem("userName") ? "Settings" : "Welcome to Briefcase"}</DialogTitle>
          <DialogDescription>
            {localStorage.getItem("userName")
              ? "Update your information below"
              : "Please enter your name to get started"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="apiKey">OpenAI API Key</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    <p className="max-w-[300px]">
                      Briefcase has a limit of 10 messages per day. 
                      For unlimited access, please enter your OpenAI Key.
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
              placeholder="Enter your OpenAI API Key"
            />
            <p className="text-muted-foreground text-xs">Your API key will not be stored on our servers. It is only used to authenticate your requests to the OpenAI API.</p>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="bg-[#3675F1] hover:bg-[#2556E4] w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                localStorage.getItem("userName") ? "Save Settings" : "Start Chatting"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
