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
import { Info } from "lucide-react";
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setName(storedName);
    }
    const storedApiKey = localStorage.getItem("openaiApiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem("userName", name);
      localStorage.setItem("openaiApiKey", apiKey);
      onNameChange(name);
      onApiKeyChange(apiKey);
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
    return null; // or a loading spinner
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen && !name.trim()) {
        toast({
          description: "Please enter a name before closing",
          variant: "destructive",
        });
      } else {
        onOpenChange(newOpen);
      }
    }}>
      <DialogContent>
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
              onChange={(e) => setName(e.target.value)}
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
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
              placeholder="Enter your OpenAI API Key"
            />
            <p className="text-muted-foreground text-xs">Your API key will not be stored on our servers. It is only used to authenticate your requests to the OpenAI API.</p>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="bg-[#3675F1] hover:bg-[#2556E4] w-full"
            >
              {localStorage.getItem("userName") ? "Save Settings" : "Start Chatting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
