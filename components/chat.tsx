"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Columns2, Menu, PenSquare, FileIcon, FileText } from "lucide-react";
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
import { ThemeToggle } from "./theme-toggle";
import { v4 as uuidv4 } from "uuid";
import { readFileAsText } from "@/lib/fileUtils";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "@/styles/markdown.css";

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  conversationId: string;
}

export default function Chat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("id");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [documentContexts, setDocumentContexts] = useState<{ [id: string]: string }>({});
  const [pinnedDocuments, setPinnedDocuments] = useState<Document[]>([]);

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
    initialMessages:
      conversations.find((c) => c.id === currentConversationId)?.messages || [],
    onFinish: (message) => {
      if (currentConversationId) {
        updateConversation(currentConversationId, message);
      }
    },
    body: {
      documentContexts: currentConversationId ? documentContexts[currentConversationId] || "" : "",
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteQuestion, setQuoteQuestion] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const storedConversations = JSON.parse(
      localStorage.getItem("conversations") || "[]"
    );
    const parsedConversations = storedConversations.map((conv: any) => ({
      ...conv,
      createdAt: new Date(conv.createdAt),
      messages: conv.messages.map((msg: any) => ({
        ...msg,
        createdAt: msg.createdAt ? new Date(msg.createdAt) : undefined,
      })),
    }));
    setConversations(parsedConversations);

    const storedDocuments = JSON.parse(
      localStorage.getItem("documents") || "[]"
    );
    setDocuments(storedDocuments);

    if (conversationId) {
      const conversation = parsedConversations.find(
        (conv: Conversation) => conv.id === conversationId
      );
      if (conversation) {
        setCurrentConversationId(conversationId);
        setMessages(conversation.messages);
      }
    }
  }, [conversationId, setMessages]);

  useEffect(() => {
    if (conversations.length > 0) {
      const serializedConversations = conversations.map((conv) => {
        let createdAtString;
        try {
          createdAtString =
            conv.createdAt instanceof Date
              ? conv.createdAt.toISOString()
              : new Date(conv.createdAt).toISOString();
        } catch (error) {
          console.error(`Invalid date for conversation ${conv.id}:`, error);
          createdAtString = new Date().toISOString(); // Fallback to current date
        }

        return {
          ...conv,
          createdAt: createdAtString,
          messages: conv.messages.map((msg) => {
            let msgCreatedAtString;
            try {
              msgCreatedAtString = msg.createdAt
                ? new Date(msg.createdAt).toISOString()
                : undefined;
            } catch (error) {
              console.error(
                `Invalid date for message in conversation ${conv.id}:`,
                error
              );
              msgCreatedAtString = undefined; // Fallback to undefined for message date
            }

            return {
              ...msg,
              createdAt: msgCreatedAtString,
            };
          }),
        };
      });

      localStorage.setItem(
        "conversations",
        JSON.stringify(serializedConversations)
      );
    }
  }, [conversations]);

  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem("documents", JSON.stringify(documents));
    }
  }, [documents]);

  const startNewChat = () => {
    const newId = uuidv4();
    const newConversation: Conversation = {
      id: newId,
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    };
    setConversations((prev) => [...prev, newConversation]);
    setCurrentConversationId(newId);
    setMessages([]);
    router.push(`/?id=${newId}`);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    let currentId = currentConversationId || uuidv4();

    if (!currentConversationId) {
      const newConversation: Conversation = {
        id: currentId,
        title: input.trim().slice(0, 30) + (input.trim().length > 30 ? "..." : ""),
        messages: [],
        createdAt: new Date(),
      };
      setConversations((prev) => [...prev, newConversation]);
      setCurrentConversationId(currentId);
      router.push(`/?id=${currentId}`);
    }

    const userMessage: Message = { id: uuidv4(), role: 'user', content: input };
    updateConversation(currentId, userMessage);
    handleSubmit(e);
  };

  const updateConversation = (id: string, message: Message) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id
          ? {
              ...conv,
              messages: [...conv.messages, message],
              title: conv.messages.length === 0 && message.role === 'user'
                ? message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "")
                : conv.title,
            }
          : conv
      )
    );
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => {
      const updatedConversations = prev.filter((conv) => conv.id !== id);
      localStorage.setItem(
        "conversations",
        JSON.stringify(updatedConversations)
      );

      if (currentConversationId === id) {
        const index = prev.findIndex((conv) => conv.id === id);
        if (updatedConversations.length > 0) {
          const newConversationId =
            index > 0
              ? updatedConversations[index - 1].id
              : updatedConversations[0].id;
          setCurrentConversationId(newConversationId);
          setMessages(
            updatedConversations.find((conv) => conv.id === newConversationId)
              ?.messages || []
          );
        } else {
          setCurrentConversationId(null);
          setMessages([]);
        }
      }

      return updatedConversations;
    });
  };

  useEffect(() => {
    if (currentConversationId) {
      router.push(`/?id=${currentConversationId}`);
    } else {
      router.push("/");
    }
  }, [currentConversationId, router]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && currentConversationId) {
      const file = e.target.files[0];
      try {
        const text = await readFileAsText(file);
        
        setDocumentContexts(prev => ({
          ...prev,
          [currentConversationId]: (prev[currentConversationId] || "") + "\n\n" + text
        }));

        const newDocument: Document = {
          id: uuidv4(),
          name: file.name,
          type: file.type,
          size: file.size,
          conversationId: currentConversationId,
        };
        setDocuments((prev) => [...prev, newDocument]);
        setPinnedDocuments((prev) => [...prev, newDocument]);

        toast({
          description: `Document "${file.name}" has been uploaded and pinned to the current conversation.`,
        });
      } catch (error) {
        console.error("Error reading file:", error);
        toast({
          description: "Error uploading document. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => {
      const updatedDocuments = prev.filter((doc) => doc.id !== id);
      localStorage.setItem("documents", JSON.stringify(updatedDocuments));
      return updatedDocuments;
    });
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
      setConversations((prev) =>
        prev.filter((conv) => conv.id !== currentConversationId)
      );
      setCurrentConversationId(null);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    if (currentConversationId) {
      const docs = documents.filter(
        (doc) => doc.conversationId === currentConversationId
      );
      setPinnedDocuments(docs);
    } else {
      setPinnedDocuments([]);
    }
  }, [currentConversationId, documents]);

  useEffect(() => {
    if (currentConversationId) {
      const currentConversation = conversations.find(conv => conv.id === currentConversationId);
      if (currentConversation) {
        setMessages(currentConversation.messages);
      }
    }
  }, [currentConversationId, conversations]);

  return (
    <div className="flex h-screen bg-background">
      {isSidebarOpen && (
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onConversationSelect={(id) => {
            setCurrentConversationId(id);
            const conversation = conversations.find((conv) => conv.id === id);
            if (conversation) {
              setMessages(conversation.messages);
              router.push(`/?id=${id}`);
            }
          }}
          onConversationDelete={deleteConversation}
          onNewChat={startNewChat}
          onToggleSidebar={toggleSidebar}
        />
      )}
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
        <div className="flex-1 flex flex-col overflow-hidden">
          {pinnedDocuments.length > 0 && (
            <div className="bg-muted-foreground/20 p-2 m-2 flex flex-col space-y-2 rounded-md sticky top-0 z-10 border border-border">
              <div className="flex items-center text-center space-x-2">
                <span className="text-sm font-medium">Pinned Documents</span>
              </div>
              <div className="flex flex-col space-y-1">
                {pinnedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center space-x-2 bg-background border border-border rounded-md p-2"
                  >
                    <div className="bg-pink-500 rounded-lg p-2">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm">{doc.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <ScrollArea className="flex-1">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-20 pt-32">
                <div className="text-center max-w-md mx-auto">
                  <h2 className="text-2xl font-semibold mb-2">
                    Welcome to the Legal Assistant
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Start a conversation or upload a document to get legal
                    advice
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 p-4">
                {messages.map(
                  (message, index) =>
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
                              ? "bg-muted-foreground/20"
                              : ""
                          }`}
                        >
                          {message.role === "user" ? (
                            <p>{message.content}</p>
                          ) : (
                            <ReactMarkdown
                              rehypePlugins={[
                                rehypeRaw,
                                rehypeSanitize,
                                rehypeHighlight,
                              ]}
                              className="markdown-content"
                            >
                              {message.content}
                            </ReactMarkdown>
                          )}
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleRetry}
                            >
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
                )}
              </div>
            )}
            {isLoading && (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </ScrollArea>
        </div>

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
                accept=".pdf,.docx,.txt,.md"
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
            content={messages
              .filter((m) => m && m.content)
              .map((m) => m.content)
              .join("\n")}
            initialQuestion={quoteQuestion}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
