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
              ? "Update your name and OpenAI API key"
              : "Please enter your name to get started"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <Label htmlFor="apiKey">OpenAI API Key (optional)</Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
              placeholder="Enter your OpenAI API Key"
            />
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
