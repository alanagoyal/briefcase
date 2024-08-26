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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import FeeCalculator from "./fee-calculator";
import { Avatar } from "./ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import { v4 as uuidv4 } from "uuid";

export default function Chat() {
  const [conversations, setConversations] = useState<{ id: string; title: string }[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [storedMessages, setStoredMessages] = useState<Message[]>([]);

  useEffect(() => {
    const savedConversations = localStorage.getItem("conversations");
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
    const currentId = localStorage.getItem("currentConversationId");
    if (currentId) {
      setCurrentConversationId(currentId);
      const savedMessages = localStorage.getItem(`chatHistory_${currentId}`);
      if (savedMessages) {
        setStoredMessages(JSON.parse(savedMessages));
      }
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
    id: currentConversationId || undefined,
  });
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteQuestion, setQuoteQuestion] = useState<string>("");

  const startNewChat = () => {
    const newId = uuidv4();
    const newTitle = "New Chat";
    setCurrentConversationId(newId);
    setConversations(prev => [...prev, { id: newId, title: newTitle }]);
    localStorage.setItem("currentConversationId", newId);
    localStorage.setItem("conversations", JSON.stringify([...conversations, { id: newId, title: newTitle }]));
    setMessages([]);
    setStoredMessages([]);
  };

  const updateConversationTitle = (id: string, newTitle: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === id ? { ...conv, title: newTitle } : conv
    ));
    localStorage.setItem("conversations", JSON.stringify(
      conversations.map(conv => conv.id === id ? { ...conv, title: newTitle } : conv)
    ));
  };

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() && !file) return;

    let currentId = currentConversationId;
    if (!currentId) {
      startNewChat();
      currentId = currentConversationId!;
    }

    // Update the title if this is the first message in a chat
    if (messages.length === 0) {
      const newTitle = input.trim().slice(0, 30) + (input.length > 30 ? '...' : '');
      updateConversationTitle(currentId, newTitle);
    }

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
      const userMessage = { content: input, role: "user" as const };
      const updatedMessages = [...messages, userMessage];

      handleSubmit(e, {
        options: {
          body: {
            content,
            fileContent: fileContent || newFileContent || null,
          },
        },
      });

      // Save the entire conversation to local storage after receiving the response
      const latestMessages = [
        ...updatedMessages,
        messages[messages.length - 1],
      ];
      localStorage.setItem(
        `chatHistory_${currentId}`,
        JSON.stringify(latestMessages)
      );
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
      setDocuments((prevDocs) => {
        // Only add the file if it's not already in the list
        if (
          !prevDocs.some(
            (doc) => doc.name === file.name && doc.size === file.size
          )
        ) {
          return [...prevDocs, file];
        }
        return prevDocs;
      });
      inputRef.current?.focus();

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleGetQuote = (index: number) => {
    // Find the user message that prompted this assistant message
    if (index > 0 && messages[index - 1].role === "user") {
      const question = messages[index - 1].content;
      console.log("Setting quote question:", question); // Debug log
      setQuoteQuestion(question);
    } else {
      console.log(
        "No user message found before assistant message at index:",
        index
      ); // Debug log
    }
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
    if (currentConversationId) {
      localStorage.removeItem(`chatHistory_${currentConversationId}`);
      setMessages([]);
      setStoredMessages([]);
      setConversations(prev => prev.filter(conv => conv.id !== currentConversationId));
      localStorage.setItem("conversations", JSON.stringify(conversations.filter(conv => conv.id !== currentConversationId)));
      setCurrentConversationId(null);
      localStorage.removeItem("currentConversationId");
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        documents={documents}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onConversationSelect={(id) => {
          setCurrentConversationId(id);
          localStorage.setItem("currentConversationId", id);
          const savedMessages = localStorage.getItem(`chatHistory_${id}`);
          if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
          } else {
            setMessages([]);
          }
        }}
        onConversationDelete={clearChatHistory}
        onNewChat={startNewChat}
      />
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-background flex justify-end items-center space-x-2">
          <ThemeToggle />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={clearChatHistory}
            className="h-10 w-10 p-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Avatar
            className="h-10 w-10"
            style={{
              background: "linear-gradient(48deg, #74EBD5 0%, #9FACE6 100%)",
            }}
          ></Avatar>
        </div>
        <ScrollArea className="flex-1 flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-20 pt-32">
              <div className="text-center max-w-md mx-auto">
                <h2 className="text-2xl font-semibold mb-2">
                  Welcome to the Legal Assistant
                </h2>
                <p className="text-muted-foreground mb-4">
                  Start a conversation or upload a document to get legal advice
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-4">
              {messages.map((message, index) => (
                message && (
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGetQuote(index)}
                        >
                          Get Quote
                        </Button>
                      </div>
                    )}
                  </div>
                )
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
          <FeeCalculator
            summary={messages[messages.length - 1]?.content || ""}
            content={messages.filter(m => m && m.content).map(m => m.content).join("\n")}
            initialQuestion={quoteQuestion}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}