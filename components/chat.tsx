"use client";

import { useState, useRef, useEffect } from "react";
import { Columns2, Menu, PenSquare } from "lucide-react";
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
  const [conversations, setConversations] = useState<{ id: string; title: string; messages: Message[] }[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<{ name: string; type: string; size: number }[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    id: currentConversationId || undefined,
  });

  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteQuestion, setQuoteQuestion] = useState<string>("");

  const startNewChat = () => {
    const newId = uuidv4();
    const newTitle = "New Chat";
    setCurrentConversationId(newId);
    setConversations(prev => [...prev, { id: newId, title: newTitle, messages: [] }]);
    setMessages([]);
  };

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() && !file) return;

    let currentId = currentConversationId || uuidv4();
    const newTitle = input.trim().slice(0, 30) + (input.length > 30 ? '...' : '');

    if (!currentConversationId) {
      setCurrentConversationId(currentId);
      setConversations(prev => [...prev, { id: currentId, title: newTitle, messages: [] }]);
    }

    let content = input;
    if (file) {
      const fileContent = await readFileContent(file);
      content += `\n\nFile content:\n${fileContent}`;
    }

    handleSubmit(e, {
      options: {
        body: { content },
      },
    });

    setFile(null);
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsText(file);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setDocuments((prevDocs) => {
        const newDoc = { name: file.name, type: file.type, size: file.size };
        return [...prevDocs, newDoc];
      });
      inputRef.current?.focus();

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleGetQuote = (index: number) => {
    if (index > 0 && messages[index - 1].role === "user") {
      const question = messages[index - 1].content;
      setQuoteQuestion(question);
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
    toast({
      description: `${isPositive ? "Positive" : "Negative"} feedback submitted`,
    });
  };

  const clearChatHistory = () => {
    if (currentConversationId) {
      setMessages([]);
      setConversations(prev => prev.filter(conv => conv.id !== currentConversationId));
      setCurrentConversationId(null);
    }
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setMessages([]);
    }
  };

  const deleteDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (currentConversationId) {
      updateConversationMessages(messages);
    }
  }, [messages, currentConversationId]);

  const updateConversationMessages = (newMessages: Message[]) => {
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversationId ? { ...conv, messages: newMessages } : conv
    ));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {isSidebarOpen ? (
        <Sidebar
          documents={documents}
          conversations={conversations}
          currentConversationId={currentConversationId}
          onConversationSelect={(id) => {
            setCurrentConversationId(id);
            const conversation = conversations.find(conv => conv.id === id);
            if (conversation) {
              setMessages(conversation.messages);
            } else {
              setMessages([]);
            }
          }}
          onConversationDelete={deleteConversation}
          onDocumentDelete={deleteDocument}
          onNewChat={startNewChat}
          onToggleSidebar={toggleSidebar}
        />
      ) : null}
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-background flex items-center space-x-2">
          {!isSidebarOpen && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                aria-label="Open sidebar"
              >
                <Columns2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={startNewChat}
                aria-label="New chat"
              >
                <PenSquare className="h-5 w-5" />
              </Button>
            </>
          )}
          <div className="flex-grow"></div>
          <ThemeToggle />
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