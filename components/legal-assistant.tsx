"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Paperclip,
  Send,
  Loader2,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Trash2,
} from "lucide-react";
import { useChat, Message } from "ai/react";
import Sidebar from "./sidebar";
import { toast } from "./ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import FeeCalculator from "./fee-calculator";

export default function Component() {
  const [storedMessages, setStoredMessages] = useState<Message[]>([]);

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      setStoredMessages(JSON.parse(savedMessages));
    }
  }, []);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    reload,
    setMessages,
  } = useChat({
    api: "/api/chat",
    initialMessages: storedMessages,
  });
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() && !file) return;

    let content = input;
    let newFileContent: string | null = null;
    if (file) {
      console.log(
        `Handling file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`
      );
      newFileContent = await readFileContent(file);
      setFileContent(newFileContent);
      content += `\n\nFile content:\n${newFileContent}`;
      console.log(
        `File content added to message. Total content length: ${content.length}`
      );
    }

    console.log("Submitting message to API");
    try {
      const userMessage = { content: input, role: 'user' as const };
      const updatedMessages = [...messages, userMessage];
      
      await handleSubmit(e, {
        options: {
          body: {
            content,
            fileContent: fileContent || newFileContent || null,
          },
        },
      });
      
      // Save the entire conversation to local storage after receiving the response
      const latestMessages = [...updatedMessages, messages[messages.length - 1]];
      localStorage.setItem('chatHistory', JSON.stringify(latestMessages));
    } catch (error) {
      console.error("Error submitting message:", error);
    }
    setFile(null);
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        console.log(
          `File read successfully. Result length: ${
            (event.target?.result as string).length
          }`
        );
        resolve(event.target?.result as string);
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(error);
      };

      console.log("Reading file as text");
      reader.readAsText(file);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(
        `File selected: ${file.name}, type: ${file.type}, size: ${file.size} bytes`
      );
      setFile(file);
      setDocuments(prevDocs => {
        // Only add the file if it's not already in the list
        if (!prevDocs.some(doc => doc.name === file.name && doc.size === file.size)) {
          return [...prevDocs, file];
        }
        return prevDocs;
      });
      inputRef.current?.focus();
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGetQuote = () => {
    setIsQuoteDialogOpen(true);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      description: "Message copied to clipboard",
    });
  };

  const handleRetry = () => {
    reload();
    toast({
      description: "Regenerating response...",
    });
  };

  const handleFeedback = (isPositive: boolean) => {
    console.log(`User gave ${isPositive ? "positive" : "negative"} feedback`);
    toast({
      description: `${isPositive ? "Positive" : "Negative"} feedback submitted`,
    });
  };

  const clearChatHistory = () => {
    localStorage.removeItem('chatHistory');
    setMessages([]);
    setStoredMessages([]);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar documents={documents} />
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-20 pt-32">
              <div className="text-center max-w-md mx-auto">
                <h2 className="text-2xl font-semibold mb-2">Welcome to the Legal Assistant</h2>
                <p className="text-muted-foreground mb-4">Start a conversation or upload a document to get legal advice</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    message.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-2 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                  {message.role === "assistant" && (
                    <div className="mt-2 flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(message.content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleRetry}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeedback(true)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeedback(false)}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleGetQuote}>
                        Get Quote
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {isLoading && (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSend} className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={handleInputChange}
                className="flex-1"
                ref={inputRef}
                autoFocus
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="outline" onClick={clearChatHistory}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                File selected: {file.name}
              </p>
            )}
          </form>
        </div>
      </div>
      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Fee Calculator</DialogTitle>
            <DialogDescription>Ask a question to get a quote</DialogDescription>
          </DialogHeader>
          <FeeCalculator summary={messages[messages.length - 1]?.content || ""} content={messages.map(m => m.content).join("\n")} />
        </DialogContent>
      </Dialog>
    </div>
  );
}