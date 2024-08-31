"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Columns2,
  PenSquare,
  FileText,
  Briefcase,
  Settings,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Paperclip,
  Send,
  Loader2,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
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
import { v4 as uuidv4 } from "uuid";
import { readFileAsText } from "@/lib/fileUtils";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import "@/styles/markdown.css";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import SettingsDialog from "./settings-dialog";

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  documentContext?: string;
  documents?: Document[];
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  conversationId: string;
}

export default function Chat() {
  // Router and search params
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("id");

  // State declarations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [documentContext, setDocumentContext] = useState<string>("");
  const [pinnedDocuments, setPinnedDocuments] = useState<Document[]>([]);
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [userName, setUserName] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userApiKey, setUserApiKey] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [isStreamStarted, setIsStreamStarted] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [lastRequestId, setLastRequestId] = useState<string | null>(null);

  // useChat hook
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
      setIsStreamStarted(false);
    },
    body: {
      documentContext: documentContext,
      userApiKey: userApiKey,
    },
    onResponse: (response) => {
      const spanId = response.headers.get("x-braintrust-span-id");
      if (spanId) {
        setLastRequestId(spanId);
      } else {
        console.warn("No x-braintrust-span-id found in response headers");
      }
    },
  });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteQuestion, setQuoteQuestion] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // useEffects

  // Load conversations and documents from localStorage
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
        setDocumentContext(conversation.documentContext || "");
      }
    }
  }, [conversationId, setMessages]);

  // Save conversations to localStorage when they change
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
          createdAtString = new Date().toISOString();
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
              msgCreatedAtString = undefined;
            }

            return {
              ...msg,
              createdAt: msgCreatedAtString,
            };
          }),
          documentContext: conv.documentContext,
          documents: conv.documents,
        };
      });

      localStorage.setItem(
        "conversations",
        JSON.stringify(serializedConversations)
      );
    }
  }, [conversations]);

  // Save documents to localStorage when they change
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem("documents", JSON.stringify(documents));
    }
  }, [documents]);

  // Load user name and API key from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    } else {
      setIsSettingsOpen(true);
    }

    const storedApiKey = localStorage.getItem("openaiApiKey");
    if (storedApiKey) {
      setUserApiKey(storedApiKey);
    }
  }, []);

  // Update URL when current conversation changes
  useEffect(() => {
    if (currentConversationId) {
      router.push(`/?id=${currentConversationId}`);
    } else {
      router.push("/");
    }
  }, [currentConversationId, router]);

  // Update pinned documents when current conversation changes
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

  // Update messages when current conversation changes
  useEffect(() => {
    if (currentConversationId) {
      const currentConversation = conversations.find(
        (conv) => conv.id === currentConversationId
      );
      if (currentConversation) {
        setMessages(currentConversation.messages);
      }
    }
  }, [currentConversationId, conversations]);

  // Focus input when focusTrigger changes
  useEffect(() => {
    if (focusTrigger > 0) {
      inputRef.current?.focus();
    }
  }, [focusTrigger]);

  // Add this effect to detect when streaming starts
  useEffect(() => {
    if (
      isLoading &&
      messages.length > 0 &&
      messages[messages.length - 1].role === "assistant"
    ) {
      setIsStreamStarted(true);
    }
  }, [isLoading, messages]);

  // Load message count and API key from localStorage
  useEffect(() => {
    const storedCount = localStorage.getItem("messageCount");
    const storedApiKey = localStorage.getItem("openaiApiKey");

    if (storedCount) {
      const count = parseInt(storedCount, 10);
      setMessageCount(count);
      setIsLimitReached(count >= 10 && !storedApiKey);
    } 

    if (storedApiKey) {
      setUserApiKey(storedApiKey);
    }
  }, []);

  // Save message count to localStorage whenever it changes
  useEffect(() => {
    if (messageCount > 0) {
      localStorage.setItem("messageCount", messageCount.toString());
    }
    setIsLimitReached(messageCount >= 10 && !userApiKey);
  }, [messageCount, userApiKey]);


  // Handle API key changes
  useEffect(() => {
    if (userApiKey) {
      setIsLimitReached(false);
    } else {
      setIsLimitReached(messageCount >= 10);
    }
  }, [userApiKey, messageCount]);

  // Modified showToast function
  const showToast = useCallback(
    (message: string, variant: "default" | "destructive") => {
      setTimeout(() => {
        toast({
          description: message,
          variant: variant,
        });
      }, 0);
    },
    []
  );

  // Effect to show toast when limit is reached
  useEffect(() => {
    if (isLimitReached && !userApiKey) {
      showToast(
        "You've reached the message limit. Please set your OpenAI API key for unlimited use.",
        "destructive"
      );
    }
  }, [isLimitReached, userApiKey, showToast]);

  // Increment message count
  const incrementMessageCount = useCallback(() => {
    setMessageCount((prevCount) => {
      const newCount = prevCount + 1;
      localStorage.setItem("messageCount", newCount.toString());
      if (newCount === 2 && !userApiKey) {
        showToast(
          "You have 1 message left before reaching the limit.",
          "destructive"
        );
      }
      return newCount;
    });
  }, [userApiKey, showToast]);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const observer = new MutationObserver(scrollToBottom);
    observer.observe(scrollArea, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [scrollToBottom]);

  // Helper functions
  const startNewChat = () => {
    if (isLimitReached && !userApiKey) {
      showToast(
        "You've reached the message limit. Please set your OpenAI API key for unlimited use.",
        "destructive"
      );
      return;
    }

    const newId = uuidv4();
    const newConversation: Conversation = {
      id: newId,
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    };
    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversationId(newId);
    setMessages([]);
    router.push(`/?id=${newId}`);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) {
      return;
    }
    if (isLimitReached && !userApiKey) {
      showToast(
        "You've reached the message limit. Please set your OpenAI API key for unlimited use.",
        "destructive"
      );
      return;
    }

    let currentId = currentConversationId || uuidv4();

    if (!currentConversationId) {
      const newConversation: Conversation = {
        id: currentId,
        title:
          input.trim().slice(0, 30) + (input.trim().length > 30 ? "..." : ""),
        messages: [],
        createdAt: new Date(),
      };
      setConversations((prev) => [newConversation, ...prev]);
      setCurrentConversationId(currentId);
      router.push(`/?id=${currentId}`);
    }

    const userMessage: Message = { id: uuidv4(), role: "user", content: input };
    updateConversation(currentId, userMessage);
    incrementMessageCount();
    handleSubmit(e);
  };

  const generateTitle = useCallback(
    async (id: string, userMessage: string, assistantMessage: string) => {
      setIsGeneratingTitle(true);
      try {
        const response = await fetch("/api/generate-title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userMessage, assistantMessage }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to generate title: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();

        if (data.title) {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === id ? { ...conv, title: data.title } : conv
            )
          );

          // Update localStorage
          localStorage.setItem(
            "conversations",
            JSON.stringify(
              conversations.map((conv) =>
                conv.id === id ? { ...conv, title: data.title } : conv
              )
            )
          );
        } else {
          console.error("No title in response:", data);
        }
      } catch (error) {
        console.error("Error generating title:", error);
        toast({
          description: "Failed to generate title. Using default.",
          variant: "destructive",
        });
      } finally {
        setIsGeneratingTitle(false);
      }
    },
    [conversations, toast]
  );

  const updateConversation = useCallback(
    (id: string, message: Message) => {
      setConversations((prev) => {
        const updatedConversations = prev.map((conv) => {
          if (conv.id === id) {
            const updatedMessages = [...conv.messages, message];
            const shouldGenerateTitle =
              message.role === "assistant" &&
              updatedMessages.filter((m) => m.role === "assistant").length ===
                1;

            if (shouldGenerateTitle) {
              setTimeout(
                () =>
                  generateTitle(id, message.content, conv.messages[0].content),
                0
              );
            }

            return {
              ...conv,
              messages: updatedMessages,
            };
          }
          return conv;
        });

        return updatedConversations;
      });
    },
    [generateTitle]
  );

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const index = prev.findIndex((conv) => conv.id === id);
        const updatedConversations = prev.filter((conv) => conv.id !== id);

        if (currentConversationId === id) {
          let newSelectedId = null;
          if (index > 0) {
            // Select the conversation above
            newSelectedId = updatedConversations[index - 1].id;
          } else if (updatedConversations.length > 0) {
            // Select the first conversation (which was below the deleted one)
            newSelectedId = updatedConversations[0].id;
          }

          // Update the currentConversationId
          setCurrentConversationId(newSelectedId);
        }

        // Update localStorage
        localStorage.setItem(
          "conversations",
          JSON.stringify(updatedConversations)
        );

        return updatedConversations;
      });
    },
    [currentConversationId, setCurrentConversationId]
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && currentConversationId) {
      const file = e.target.files[0];
      try {
        const text = await readFileAsText(file);

        const newDocument: Document = {
          id: uuidv4(),
          name: file.name,
          type: file.type,
          size: file.size,
          content: text,
          conversationId: currentConversationId,
        };

        const newDocumentContext = (documentContext || "") + "\n\n" + text;
        setDocumentContext(newDocumentContext);

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  documentContext: newDocumentContext,
                  documents: [...(conv.documents || []), newDocument],
                }
              : conv
          )
        );

        setDocuments((prev) => [...prev, newDocument]);
        setPinnedDocuments((prev) => [...prev, newDocument]);

        // Focus on the chat input after file upload
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      } catch (error) {
        console.error("Error reading file:", error);
        toast({
          description: "Error uploading document. Please try again.",
          variant: "destructive",
        });
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
    if (isLimitReached && !userApiKey) {
      showToast(
        "You've reached the message limit. Please set your OpenAI API key for unlimited use.",
        "destructive"
      );
      return;
    }

    incrementMessageCount();
    reload();
  };

  const handleFeedback = useCallback(
    async (isPositive: boolean) => {
      if (!lastRequestId) {
        console.error("No request ID available for feedback");
        toast({
          description: "Unable to submit feedback at this time",
          variant: "destructive",
        });
        return;
      }

      toast({
        description: `${
          isPositive ? "Positive" : "Negative"
        } feedback submitted`,
      });

      try {
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId: lastRequestId,
            score: isPositive ? 1 : 0,
            comment: "",
            userId: userName || "anonymous",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to submit feedback");
        }
      } catch (error) {
        console.error("Error submitting feedback:", error);
        toast({
          description: "Failed to submit feedback",
          variant: "destructive",
        });
      }
    },
    [lastRequestId, userName, toast]
  );

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const removeDocument = (docId: string) => {
    setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== docId));
    setPinnedDocuments((prevPinned) =>
      prevPinned.filter((doc) => doc.id !== docId)
    );

    if (currentConversationId) {
      setConversations((prevConvs) =>
        prevConvs.map((conv) => {
          if (conv.id === currentConversationId) {
            const updatedDocs =
              conv.documents?.filter((doc) => doc.id !== docId) || [];
            const updatedContext = updatedDocs
              .map((doc) => doc.content)
              .join("\n\n");
            return {
              ...conv,
              documents: updatedDocs,
              documentContext: updatedContext,
            };
          }
          return conv;
        })
      );

      // Update the current document context
      const updatedContext = pinnedDocuments
        .filter((doc) => doc.id !== docId)
        .map((doc) => doc.content)
        .join("\n\n");
      setDocumentContext(updatedContext);
    }
  };

  // Render
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
              setFocusTrigger((prev) => prev + 1);
            }
          }}
          onConversationDelete={deleteConversation}
          onNewChat={startNewChat}
          onToggleSidebar={toggleSidebar}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isGeneratingTitle={isGeneratingTitle}
        />
      )}
      <div className="flex-1 flex flex-col">
        <div className="p-2 bg-background flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!isSidebarOpen && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleSidebar}
                      aria-label="Open sidebar"
                    >
                      <Columns2 className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open sidebar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {!isSidebarOpen && (
              <h1 className="text-2xl font-bold text-[#3675F1] font-['Avenir'] flex items-center">
                Briefcase
              </h1>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {!isSidebarOpen && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={startNewChat}
                        aria-label="New chat"
                      >
                        <PenSquare className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>New chat</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {pinnedDocuments.length > 0 && (
            <div className="bg-muted p-2 m-2 flex flex-col space-y-2 rounded-md sticky top-0 z-10">
              <div className="flex items-center text-center space-x-2">
                <span className="text-sm font-medium">Pinned Documents</span>
              </div>
              <div className="flex flex-col space-y-1">
                {pinnedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between space-x-2 bg-background border border-border rounded-md p-2"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="bg-[#8EC5FC] rounded-lg p-2">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm">{doc.name}</span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove document</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
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
                        className={`mb-4 flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        } items-start`}
                      >
                        {message.role === "assistant" && (
                          <Avatar className="h-8 w-8 mr-2 flex-shrink-0 mt-1">
                            <AvatarFallback className="bg-[#3675F1]">
                              <Briefcase className="h-5 w-5 text-white" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] ${
                            message.role === "user" ? "order-1" : "order-2"
                          }`}
                        >
                          <div
                            className={`inline-block p-2 rounded-lg ${
                              message.role === "user" ? "bg-muted" : ""
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
                          {message.role === "assistant" && !isStreamStarted && (
                            <div className="mt-2 flex items-center space-x-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleCopy(message.content)
                                      }
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Copy</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={handleRetry}
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Regenerate</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleFeedback(true)}
                                    >
                                      <ThumbsUp className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Good response</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleFeedback(false)}
                                    >
                                      <ThumbsDown className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Bad response</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <Button
                                className="hover:bg-[#2556E4] hover:text-white"
                                size="sm"
                                onClick={() => handleGetQuote(index)}
                              >
                                Get Quote
                              </Button>
                            </div>
                          )}
                        </div>
                        {message.role === "user" && (
                          <Avatar className="h-8 w-8 ml-2 flex-shrink-0 mt-1 order-2">
                            <AvatarFallback className="bg-gradient-to-br from-[#8EC5FC] via-[#3675f1] to-[#2556e4] text-white font-[Avenir] font-bold">
                              {userName?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    )
                )}
              </div>
            )}
            {isLoading && !isStreamStarted && (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </div>
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
                disabled={isLimitReached && !userApiKey}
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
              <Button
                type="submit"
                size="icon"
                className="bg-[#3675F1] hover:bg-[#2556E4]"
                disabled={isLimitReached && !userApiKey}
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </form>
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Briefcase can make mistakes. Please check important info with a
            lawyer.
          </div>
        </div>
      </div>
      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Get Quote</DialogTitle>
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
      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onNameChange={(name) => {
          setUserName(name);
          if (name && !localStorage.getItem("userName")) {
            setIsSettingsOpen(false);
          }
        }}
        onApiKeyChange={(apiKey) => {
          setUserApiKey(apiKey || null);
          if (apiKey) {
            localStorage.setItem("openaiApiKey", apiKey);
          } else {
            localStorage.removeItem("openaiApiKey");
            if (messageCount >= 10) {
              setIsLimitReached(true);
            }
          }
        }}
      />
    </div>
  );
}
