"use client";

import { useI18n } from "@quetzallabs/i18n";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, Briefcase, Trash2, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Paperclip,
  Send,
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
import { KeyboardShortcuts } from "./keyboard-shortcuts";
import { isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import {
  Conversation,
  Document,
  ExtendedMessage,
  MessageFeedback,
} from "../types/chat";
import AnimatedBriefcase from "./animation";
import CommandMenu from "./command-menu";
import { useTheme } from "next-themes";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { useMobileDetect } from "./mobile-detector";
import { Header } from "./header";
import { useDropzone } from "react-dropzone";

export default function Chat() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("id");
  const skeletonHeights = ["h-16", "h-24", "h-32", "h-40", "h-48"];

  // State declarations
  const { setTheme, theme } = useTheme();
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
  const [settingsInitialTab, setSettingsInitialTab] = useState("general");
  const [userApiKey, setUserApiKey] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState<number | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [isStreamStarted, setIsStreamStarted] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isLoadingSidebar, setIsLoadingSidebar] = useState(true);
  const [messageFeedback, setMessageFeedback] = useState<{
    [key: string]: MessageFeedback;
  }>({});
  const [animatedIcons, setAnimatedIcons] = useState<{
    [key: string]: string | null;
  }>({});
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(
    null
  );
  const [seed, setSeed] = useState<number>(123);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteQuestion, setQuoteQuestion] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isSubscriptionVerified, setIsSubscriptionVerified] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Ref declarations
  const latestConversationIdRef = useRef<string | null>(null);
  const titleGenerationTriggeredRef = useRef<{ [key: string]: boolean }>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const latestRequestIdRef = useRef<string | null>(null);

  const { isMobile, isLoading: isMobileLoading } = useMobileDetect();

  // Add this constant near the top of the file, after imports
  const MESSAGE_LIMIT_REACHED = t(
    "You've reached the message limit. Please upgrade to the Pro Plan or set your OpenAI API key for unlimited use."
  );

  // Calculate remaining messages
  const remainingMessages =
    messageCount !== null ? Math.max(10 - messageCount, 0) : null;

  // Open settings with tab
  const openSettingsWithTab = (tab: string) => {
    setSettingsInitialTab(tab);
    setIsSettingsOpen(true);
  };

  // Determine if the banner should be shown
  const showBanner =
    isSubscriptionVerified &&
    !userApiKey &&
    !isSubscribed &&
    remainingMessages !== null;

  // useChat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    reload,
    setMessages,
    append,
  } = useChat({
    api: "/api/chat",
    id: currentConversationId || undefined,
    initialMessages:
      conversations.find((c) => c.id === currentConversationId)?.messages || [],
    body: {
      documentContext: documentContext,
      userApiKey: userApiKey,
      seed: seed,
    },
    onResponse: (response) => {
      const spanId = response.headers.get("x-braintrust-span-id");
      if (spanId) {
        latestRequestIdRef.current = spanId;
      } else {
        console.warn("No x-braintrust-span-id found in response headers");
      }
      setIsStreamStarted(true);
      setRegeneratingIndex(null);
    },
    onFinish: (message) => {
      const conversationId =
        currentConversationId || latestConversationIdRef.current;
      if (conversationId) {
        updateConversation(conversationId, message, latestRequestIdRef.current);
      } else {
        console.warn("No conversation ID available in onFinish");
      }
      setIsStreamStarted(false);
      setIsLoading(false);
    },
  });

  // useEffects

  // Update the sidebar state based on mobile detection
  useEffect(() => {
    if (!isMobileLoading) {
      setIsSidebarOpen(!isMobile);
    }
  }, [isMobile, isMobileLoading]);

  // Header functions
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  const handleNewChat = () => {
    startNewChat();
    if (isMobile) {
      closeSidebar();
    }
  };

  // Handle subscription status
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      verifySubscription(storedEmail);
    } else {
      setIsSubscribed(false);
      localStorage.setItem("subscriptionStatus", "inactive");
      setIsSubscriptionVerified(true);
    }
  }, []);

  // Verify subscription
  const verifySubscription = useCallback(async (email: string) => {
    try {
      const response = await fetch(
        `/api/verify-subscription?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();
      setIsSubscribed(data.isSubscribed);

      // Update local storage
      localStorage.setItem(
        "subscriptionStatus",
        data.isSubscribed ? "active" : "inactive"
      );
    } catch (error) {
      console.error("Error verifying subscription:", error);
      setIsSubscribed(false);
    } finally {
      setIsSubscriptionVerified(true);
    }
  }, []);

  // Handle success parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    if (success === "true") {
      const storedEmail = localStorage.getItem("userEmail");
      if (storedEmail) {
        verifySubscription(storedEmail);
      }
      // Remove the success parameter from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [verifySubscription]);

  // Load conversations and documents from localStorage
  useEffect(() => {
    const loadConversations = async () => {
      setIsLoadingSidebar(true);
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
      setIsLoadingSidebar(false);
    };
    loadConversations();
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

  // Load userName and API key from localStorage
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

  // Load message feedback from localStorage
  useEffect(() => {
    const storedFeedback = localStorage.getItem("messageFeedback");
    if (storedFeedback) {
      const parsedFeedback = JSON.parse(storedFeedback);
      setMessageFeedback(parsedFeedback);
    }
    const storedLastRequestId = localStorage.getItem("lastRequestId");
    if (storedLastRequestId) {
      latestRequestIdRef.current = storedLastRequestId;
    }
  }, []);

  // Save message feedback to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(messageFeedback).length > 0) {
      localStorage.setItem("messageFeedback", JSON.stringify(messageFeedback));
    }
    if (latestRequestIdRef.current) {
      localStorage.setItem("lastRequestId", latestRequestIdRef.current);
    }
  }, [messageFeedback]);

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
  }, [currentConversationId, conversations, setMessages]);

  // Focus input when focusTrigger changes
  useEffect(() => {
    if (focusTrigger > 0) {
      inputRef.current?.focus();
    }
  }, [focusTrigger]);

  // Show toast function
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

  // Load message count and API key from localStorage
  useEffect(() => {
    // Load message count from localStorage
    const storedCount = localStorage.getItem("messageCount");
    const initialCount = storedCount ? parseInt(storedCount, 10) : 0;
    setMessageCount(initialCount);

    // Load API key from localStorage
    const storedApiKey = localStorage.getItem("openaiApiKey");
    if (storedApiKey) {
      setUserApiKey(storedApiKey);
    }
  }, []); // This effect runs only once on component mount

  // Handle changes to messageCount, userApiKey, and isSubscribed
  useEffect(() => {
    // Update localStorage
    if (messageCount !== null) {
      localStorage.setItem("messageCount", messageCount.toString());
    }

    // Check if limit is reached
    const shouldLimitReach =
      messageCount !== null &&
      messageCount >= 10 &&
      !userApiKey &&
      !isSubscribed;

    // Update isLimitReached state
    setIsLimitReached(shouldLimitReach);
  }, [messageCount, userApiKey, isSubscribed]);

  // Increment message count
  const incrementMessageCount = useCallback(() => {
    if (isSubscribed || userApiKey) {
      // Don't increment if subscribed or using API key
      return;
    }
    setMessageCount((prevCount) => {
      if (prevCount !== null) {
        const newCount = prevCount + 1;
        localStorage.setItem("messageCount", newCount.toString());
        if (newCount === 9) {
          showToast(
            t("You have 1 message left before reaching the limit."),
            "destructive"
          );
        } else if (newCount === 10) {
          showToast(MESSAGE_LIMIT_REACHED, "destructive");
        }
        return newCount;
      }
      return prevCount;
    });
  }, [isSubscribed, userApiKey, showToast]);

  // Automatically scroll to bottom of chat
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
    observer.observe(scrollArea, {
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [scrollToBottom]);

  // Reset titleGenerationTriggeredRef when the conversation changes
  useEffect(() => {
    titleGenerationTriggeredRef.current = {};
  }, [currentConversationId]);

  // Helper functions for settings dialog
  const handleSettingsOpenChange = (open: boolean) => {
    setIsSettingsOpen(open);
    if (!open) {
      setSettingsInitialTab("general");
    }
  };

  const handleNameChange = (name: string) => {
    setUserName(name);
    if (name && !localStorage.getItem("userName")) {
      setIsSettingsOpen(false);
    }
  };

  const handleApiKeyChange = (apiKey: string | null) => {
    setUserApiKey(apiKey);
    if (apiKey) {
      localStorage.setItem("openaiApiKey", apiKey);
    } else {
      localStorage.removeItem("openaiApiKey");
      checkMessageLimit();
    }
  };

  const handleSubscriptionChange = (subscribed: boolean) => {
    setIsSubscribed(subscribed);
    if (subscribed) {
      setIsLimitReached(false);
    } else {
      checkMessageLimit();
    }
  };

  const checkMessageLimit = () => {
    if (messageCount !== null && messageCount >= 10 && !isSubscribed) {
      setIsLimitReached(true);
    }
  };

  // Helper function to handle conversation selection
  const handleConversationSelect = useCallback(
    (id: string) => {
      setCurrentConversationId(id);
      const conversation = conversations.find((conv) => conv.id === id);
      if (conversation) {
        setMessages(conversation.messages);
        setFocusTrigger((prev) => prev + 1);
      }
      if (isMobile) {
        closeSidebar();
      }
    },
    [conversations, setMessages, isMobile, closeSidebar]
  );

  // Start a new chat
  const startNewChat = () => {
    if (isLimitReached && !userApiKey && !isSubscribed) {
      showToast(MESSAGE_LIMIT_REACHED, "destructive");
      return;
    }
    const newId = uuidv4();
    const newConversation: Conversation = {
      id: newId,
      title: t("New Chat"),
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

  // Handle prompt click for new chat
  const handlePromptClick = async (prompt: string) => {
    if (isLimitReached && !userApiKey && !isSubscribed) {
      showToast(MESSAGE_LIMIT_REACHED, "destructive");
      return;
    }

    // Create a new conversation if it doesn't exist
    let currentId = currentConversationId || uuidv4();
    latestConversationIdRef.current = currentId;

    if (!currentConversationId) {
      const newConversation: Conversation = {
        id: currentId,
        title: t("New Chat"),
        messages: [],
        createdAt: new Date(),
      };
      setConversations((prev) => [newConversation, ...prev]);
      setCurrentConversationId(currentId);
      router.push(`/?id=${currentId}`);
    }

    // Check if it's the SAFE agreement prompt
    if (prompt === t("Summarize the terms of this SAFE agreement")) {
      // Set the input value to the prompt
      handleInputChange({
        target: { value: prompt },
      } as React.ChangeEvent<HTMLInputElement>);

      // Focus on the file input
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 0);

      return;
    }

    // Create a new user message and append it to the conversation
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: prompt,
    };
    updateConversation(currentId, userMessage, latestRequestIdRef.current);
    incrementMessageCount();
    setIsLoading(true);

    try {
      await append(userMessage, {
        options: {
          body: {
            documentContext: documentContext,
            userApiKey: userApiKey,
            seed: seed,
          },
        },
      });
    } catch (error) {
      console.error("Error appending message:", error);
      showToast(t("Failed to send message"), "destructive");
    } finally {
      setIsLoading(false);
    }

    // Focus the input immediately after setting the value
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Send a message
  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (isLimitReached && !userApiKey && !isSubscribed) {
      showToast(MESSAGE_LIMIT_REACHED, "destructive");
      return;
    }

    let currentId = currentConversationId || uuidv4();
    latestConversationIdRef.current = currentId;

    if (!currentConversationId) {
      const newConversation: Conversation = {
        id: currentId,
        title:
          input.trim().slice(0, 30) + (input.trim().length > 30 ? "..." : ""),
        messages: [],
        createdAt: new Date(),
      };
      setConversations((prev) => {
        return [newConversation, ...prev];
      });
      setCurrentConversationId(currentId);
      router.push(`/?id=${currentId}`);
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: input,
    };
    updateConversation(currentId, userMessage, latestRequestIdRef.current);
    incrementMessageCount();
    setIsLoading(true);
    handleSubmit(e);
  };

  // Generate a title for a conversation
  const generateTitle = useCallback(
    async (id: string, userMessage: string, assistantMessage: string) => {
      try {
        const response = await fetch("/api/generate-title", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userMessage,
            assistantMessage,
          }),
        });
        if (!response.ok) {
          throw new Error(`Failed to generate title: ${response.status}`);
        }
        const data = await response.json();
        if (data.title) {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === id
                ? {
                    ...conv,
                    title: data.title,
                  }
                : conv
            )
          );
        } else {
          console.error("No title in response:", data);
        }
      } catch (error) {
        console.error("Error generating title:", error);
      }
    },
    [setConversations]
  );

  // Update a conversation
  const updateConversation = useCallback(
    (id: string, message: Message, currentRequestId: string | null) => {
      setConversations((prev) => {
        const existingConv = prev.find((conv) => conv.id === id);

        if (!existingConv) {
          const newConv: Conversation = {
            id,
            title:
              message.content.slice(0, 30) +
              (message.content.length > 30 ? "..." : ""),
            messages: [message],
            createdAt: new Date(),
          };
          return [newConv, ...prev];
        }

        const updatedMessage = {
          ...message,
          requestId: currentRequestId,
        };

        const updatedMessages = [...existingConv.messages, updatedMessage];

        if (
          message.role === "assistant" &&
          !titleGenerationTriggeredRef.current[id]
        ) {
          const isFirstAssistantMessage =
            updatedMessages.filter((m) => m.role === "assistant").length === 1;
          if (isFirstAssistantMessage) {
            titleGenerationTriggeredRef.current[id] = true;
            const userMessage =
              updatedMessages.find((m) => m.role === "user")?.content || "";
            setTimeout(
              () => generateTitle(id, userMessage, message.content),
              0
            );
          }
        }

        return prev.map((conv) =>
          conv.id === id
            ? {
                ...conv,
                messages: updatedMessages,
                createdAt: new Date(),
              }
            : conv
        );
      });
    },
    [generateTitle]
  );

  // Group conversations by date for sidebar
  const groupedConversations = useMemo(() => {
    const groups = [
      {
        title: t("Today"),
        conversations: [] as Conversation[],
      },
      {
        title: t("Yesterday"),
        conversations: [] as Conversation[],
      },
      {
        title: t("This Week"),
        conversations: [] as Conversation[],
      },
      {
        title: t("This Month"),
        conversations: [] as Conversation[],
      },
      {
        title: t("Older"),
        conversations: [] as Conversation[],
      },
    ];
    conversations.forEach((conv) => {
      // Get the timestamp of the last message or use the conversation creation time
      const lastMessageTimestamp =
        conv.messages.length > 0
          ? new Date(
              conv.messages[conv.messages.length - 1].createdAt ||
                conv.createdAt
            ).getTime()
          : conv.createdAt.getTime();
      const lastMessageDate = new Date(lastMessageTimestamp);
      if (isToday(lastMessageDate)) {
        groups[0].conversations.push({
          ...conv,
          lastMessageTimestamp,
        });
      } else if (isYesterday(lastMessageDate)) {
        groups[1].conversations.push({
          ...conv,
          lastMessageTimestamp,
        });
      } else if (isThisWeek(lastMessageDate)) {
        groups[2].conversations.push({
          ...conv,
          lastMessageTimestamp,
        });
      } else if (isThisMonth(lastMessageDate)) {
        groups[3].conversations.push({
          ...conv,
          lastMessageTimestamp,
        });
      } else {
        groups[4].conversations.push({
          ...conv,
          lastMessageTimestamp,
        });
      }
    });

    // Sort conversations within each group
    groups.forEach((group) => {
      group.conversations.sort((a, b) => {
        const aTimestamp = a.lastMessageTimestamp ?? 0;
        const bTimestamp = b.lastMessageTimestamp ?? 0;
        return bTimestamp - aTimestamp;
      });
    });
    return groups.filter((group) => group.conversations.length > 0);
  }, [conversations]);

  // Delete a conversation
  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const flatConversations = groupedConversations.flatMap(
          (group) => group.conversations
        );
        const index = flatConversations.findIndex((conv) => conv.id === id);
        const updatedConversations = prev.filter((conv) => conv.id !== id);

        if (currentConversationId === id) {
          let newSelectedId = null;
          if (flatConversations.length > 1) {
            if (index > 0) {
              // Select the conversation above
              newSelectedId = flatConversations[index - 1].id;
            } else {
              // Select the first conversation (which was below the deleted one)
              newSelectedId = flatConversations[1].id;
            }
          }

          // Update the currentConversationId
          setCurrentConversationId(newSelectedId);

          // If there's a new selected conversation, set its messages
          if (newSelectedId) {
            const newSelectedConversation = updatedConversations.find(
              (conv) => conv.id === newSelectedId
            );
            if (newSelectedConversation) {
              setMessages(newSelectedConversation.messages);
            }
          } else {
            // If no conversations left, clear messages
            setMessages([]);
          }
        }

        // Update localStorage
        localStorage.setItem(
          "conversations",
          JSON.stringify(updatedConversations)
        );
        return updatedConversations;
      });
    },
    [
      currentConversationId,
      setCurrentConversationId,
      setMessages,
      groupedConversations,
    ]
  );

  // Upload a file to a conversation
  const handleFileUpload = useCallback(
    async (files: File[]) => {
      if (files && files.length > 0) {
        // Create a new conversation if it doesn't exist
        let currentId = currentConversationId || uuidv4();
        latestConversationIdRef.current = currentId;

        if (!currentConversationId) {
          const newConversation: Conversation = {
            id: currentId,
            title: t("New Chat"),
            messages: [],
            createdAt: new Date(),
          };
          setConversations((prev) => [newConversation, ...prev]);
          setCurrentConversationId(currentId);
          router.push(`/?id=${currentId}`);
        }

        // Upload file to conversation
        const file = files[0];
        try {
          const text = await readFileAsText(file);
          const newDocument: Document = {
            id: uuidv4(),
            name: file.name,
            type: file.type,
            size: file.size,
            content: text,
            conversationId: currentId,
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
            description: t("Error uploading document. Please try again."),
            variant: "destructive",
          });
        }
      }
    },
    [
      currentConversationId,
      documentContext,
      router,
      setConversations,
      setDocuments,
      setPinnedDocuments,
      t,
    ]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    noClick: true,
    noKeyboard: true,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
  });

  useEffect(() => {
    setIsDragging(isDragActive);
  }, [isDragActive]);

  // Modify the file input onChange handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(Array.from(e.target.files));
    }
  };

  // Remove a document from a conversation
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

  // Get a quote from a message
  const handleGetQuote = (index: number) => {
    if (index > 0 && messages[index - 1].role === "user") {
      const question = messages[index - 1].content;
      setQuoteQuestion(question);
    }
    setIsQuoteDialogOpen(true);
  };

  // Copy
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      description: t("Message copied to clipboard"),
    });
  };

  // Regenerate
  const handleRetry = useCallback(
    async (messageIndex: number) => {
      animateIcon("regenerate", messages[messageIndex].id);
      if (isLimitReached && !userApiKey && !isSubscribed) {
        showToast(MESSAGE_LIMIT_REACHED, "destructive");
        return;
      }
      if (messageIndex < 1 || messageIndex >= messages.length) {
        console.error(
          `[${new Date().toISOString()}] Invalid message index for regeneration`
        );
        return;
      }

      // Set regeneratingIndex immediately to start the spinning animation
      setRegeneratingIndex(messageIndex);

      // Generate a new seed for regeneration
      const newSeed = Math.floor(Math.random() * 1000000);
      setSeed(newSeed);

      // Introduce a delay before removing the message and starting regeneration
      setTimeout(() => {
        // Remove the last assistant message
        const updatedMessages = messages.slice(0, messageIndex);
        setMessages(updatedMessages);

        // Update the conversation in state and local storage
        if (currentConversationId) {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === currentConversationId
                ? {
                    ...conv,
                    messages: updatedMessages,
                  }
                : conv
            )
          );
        }

        // Call reload with the new seed
        reload({
          options: {
            body: {
              seed: newSeed,
            },
          },
        });
        incrementMessageCount();
      }, 500);
    },
    [
      messages,
      isLimitReached,
      userApiKey,
      currentConversationId,
      setMessages,
      setConversations,
      reload,
      incrementMessageCount,
      showToast,
      seed,
      isSubscribed,
    ]
  );

  // Submit feedback for a message
  const handleFeedback = useCallback(
    async (messageId: string, isPositive: boolean) => {
      const message = messages.find(
        (m) => m.id === messageId
      ) as ExtendedMessage;
      const requestId = message.requestId || latestRequestIdRef.current;
      if (!requestId) {
        console.error("No request ID available for feedback");
        toast({
          description: t("Unable to submit feedback at this time"),
          variant: "destructive",
        });
        return;
      }
      const feedbackType = isPositive ? "thumbsUp" : "thumbsDown";
      setMessageFeedback((prev) => {
        const currentFeedback = prev[messageId];

        // If the same feedback type is clicked again, remove the feedback
        if (currentFeedback?.feedbackType === feedbackType) {
          const { [messageId]: _, ...rest } = prev;
          return rest;
        } else {
          // Otherwise, set or update the feedback
          return {
            ...prev,
            [messageId]: {
              messageId,
              requestId,
              feedbackType,
            },
          };
        }
      });

      // Only show toast and submit to API if feedback is being set, not removed
      if (
        !messageFeedback[messageId] ||
        messageFeedback[messageId].feedbackType !== feedbackType
      ) {
        toast({
          description: t(`{dynamic1} feedback submitted`, {
            dynamic1: isPositive ? "Positive" : "Negative",
          }),
        });
        try {
          const response = await fetch("/api/feedback", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              requestId,
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
            description: t("Failed to submit feedback"),
            variant: "destructive",
          });
        }
      }
    },
    [messages, userName, toast, messageFeedback]
  );

  // Animate icons for message actions
  const animateIcon = (iconName: string, messageId: string) => {
    setAnimatedIcons((prev) => ({
      ...prev,
      [messageId]: iconName,
    }));
    setTimeout(() => {
      setAnimatedIcons((prev) => ({
        ...prev,
        [messageId]: null,
      }));
    }, 500);
  };

  // Early return if still detecting mobile
  if (isMobileLoading) {
    return null;
  }

  // Render
  return (
    <div className={`flex h-dvh bg-background ${isMobile ? "relative" : ""}`}>
      {((isMobile && isSidebarOpen) || !isMobile) && (
        <div
          className={`${isMobile ? "absolute inset-0 z-50" : ""} ${
            isSidebarOpen ? "" : "hidden"
          }`}
        >
          <Sidebar
            groupedConversations={groupedConversations}
            currentConversationId={currentConversationId}
            onConversationSelect={handleConversationSelect}
            onConversationDelete={deleteConversation}
            onNewChat={handleNewChat}
            onToggleSidebar={toggleSidebar}
            onOpenSettings={() => setIsSettingsOpen(true)}
            isLoading={isLoadingSidebar}
            isMobile={isMobile}
            closeSidebar={closeSidebar}
          />
        </div>
      )}
      <div
        className={`flex-1 flex flex-col ${
          isMobile && isSidebarOpen ? "hidden" : ""
        }`}
      >
        {(isMobile || !isSidebarOpen) && (
          <Header
            toggleSidebar={toggleSidebar}
            startNewChat={handleNewChat}
            isSidebarOpen={isSidebarOpen}
          />
        )}
        <div className="flex-1 flex flex-col overflow-hidden">
          {pinnedDocuments.length > 0 ? (
            <div
              className={`bg-muted p-2 m-2 flex flex-col space-y-2 rounded-md sticky top-0 z-10 ${
                messages.length === 0 ? "mb-4" : ""
              }`}
            >
              <div className="flex items-center text-center space-x-2">
                <span className="text-sm font-medium">
                  {t("Pinned Documents")}
                </span>
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
                            variant="ghost-no-hover"
                            size="sm"
                            onClick={() => removeDocument(doc.id)}
                            className="hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("Remove document")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            </div>
          ) : messages.length > 0 ? null : <div className="h-[122px] w-full" />}
          <div className="flex-1 overflow-y-auto p-4" ref={scrollAreaRef}>
            {isLoadingSidebar ? (
              <div className="flex flex-col h-screen bg-background p-4 space-y-6 overflow-y-auto">
                {[...Array(10)].map((_, index) => {
                  const heightClass =
                    skeletonHeights[index % skeletonHeights.length];
                  return (
                    <div
                      key={index}
                      className={`flex ${
                        index % 2 === 0 ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`flex ${
                          index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                        } items-start w-4/5`}
                      >
                        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                        <Skeleton
                          className={`${heightClass} w-full max-w-[calc(100%-2rem)] rounded-lg ${
                            index % 2 === 0
                              ? "ml-2 rounded-tl-none"
                              : "mr-2 rounded-tr-none"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : messages.length === 0 || conversations.length === 0 ? (
              <div className="flex-1 flex items-center justify-center h-full w-full sm:mt-[80px] md:mt-[120px]">
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="text-2xl font-semibold mb-2">
                    {t("Welcome to Briefcase")}
                  </h2>
                  <p className="text-muted-foreground mb-4 w-3/4 text-center mx-auto">
                    {t(
                      "Ask any legal question, summarize documents, and request quotes for more complex inqueries"
                    )}
                  </p>
                  <div className="flex flex-col md:grid md:grid-cols-2 gap-2 mb-8">
                    <Badge
                      variant="outline"
                      className="bg-muted text-foreground hover:bg-[#3675F1] hover:text-white px-3 py-1 text-xs cursor-pointer flex items-center justify-between"
                      onClick={() =>
                        handlePromptClick(
                          t("Explain the difference between RSUs and ISOs")
                        )
                      }
                    >
                      <span className="flex-grow text-center">
                        {t("Explain the difference between RSUs and ISOs")}
                      </span>
                      <ArrowUpRight className="h-3 w-3 ml-1 flex-shrink-0" />
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-muted text-foreground hover:bg-[#3675F1] hover:text-white px-3 py-1 text-xs cursor-pointer flex items-center justify-between"
                      onClick={() =>
                        handlePromptClick(
                          t("When is it better to form an LLC vs. a C-Corp")
                        )
                      }
                    >
                      <span className="flex-grow text-center">
                        {t("When is it better to form an LLC vs. a C-Corp")}
                      </span>
                      <ArrowUpRight className="h-3 w-3 ml-1 flex-shrink-0" />
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-muted text-foreground hover:bg-[#3675F1] hover:text-white px-3 py-1 text-xs cursor-pointer flex items-center justify-between"
                      onClick={() =>
                        handlePromptClick(
                          t("Summarize the terms of this SAFE agreement")
                        )
                      }
                    >
                      <span className="flex-grow text-center">
                        {t("Summarize the terms of this SAFE agreement")}
                      </span>
                      <ArrowUpRight className="h-3 w-3 ml-1 flex-shrink-0" />
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-muted text-foreground hover:bg-[#3675F1] hover:text-white px-3 py-1 text-xs cursor-pointer flex items-center justify-between"
                      onClick={() =>
                        handlePromptClick(
                          t("How does non-solicitation work in California")
                        )
                      }
                    >
                      <span className="flex-grow text-center">
                        {t("How does non-solicitation work in California")}
                      </span>
                      <ArrowUpRight className="h-3 w-3 ml-1 flex-shrink-0" />
                    </Badge>
                  </div>
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
                                      onClick={() => {
                                        handleCopy(message.content);
                                        animateIcon("copy", message.id);
                                      }}
                                    >
                                      <Copy
                                        className={cn(
                                          "h-4 w-4",
                                          animatedIcons[message.id] ===
                                            "copy" &&
                                            "animate-shake text-[#8EC5FC]"
                                        )}
                                      />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t("Copy")}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRetry(index)}
                                      disabled={regeneratingIndex !== null}
                                      className="disabled:opacity-100"
                                    >
                                      <RefreshCw
                                        className={cn(
                                          "h-4 w-4",
                                          animatedIcons[message.id] ===
                                            "regenerate" &&
                                            "animate-spin text-[#3675F1]"
                                        )}
                                      />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t("Regenerate")}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        handleFeedback(message.id, true);
                                        animateIcon("thumbsUp", message.id);
                                      }}
                                    >
                                      <ThumbsUp
                                        className={cn(
                                          "h-4 w-4",
                                          messageFeedback[message.id]
                                            ?.feedbackType === "thumbsUp"
                                            ? "text-green-500"
                                            : "",
                                          animatedIcons[message.id] ===
                                            "thumbsUp" && "animate-shake"
                                        )}
                                      />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t("Good response")}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        handleFeedback(message.id, false);
                                        animateIcon("thumbsDown", message.id);
                                      }}
                                    >
                                      <ThumbsDown
                                        className={cn(
                                          "h-4 w-4",
                                          messageFeedback[message.id]
                                            ?.feedbackType === "thumbsDown"
                                            ? "text-red-500"
                                            : "",
                                          animatedIcons[message.id] ===
                                            "thumbsDown" && "animate-shake"
                                        )}
                                      />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t("Bad response")}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <Button
                                className="hover:bg-[#2556E4] hover:text-white"
                                size="sm"
                                onClick={() => handleGetQuote(index)}
                              >
                                {t("Get Quote")}
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
                <AnimatedBriefcase />
              </div>
            )}
          </div>
        </div>
        {showBanner && (
          <div className="text-sm text-muted-foreground px-4 py-2 w-full bg-muted">
            <p className="inline">
              {t(
                `You have {remainingMessages} message{pluralize} remaining. To send more messages, please upgrade to the Pro Plan or set your OpenAI API key in `,
                {
                  remainingMessages: remainingMessages,
                  pluralize: remainingMessages !== 1 ? "s" : "",
                }
              )}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openSettingsWithTab("advanced");
                }}
                className="font-bold hover:underline focus:outline-none"
              >
                {t("settings")}
              </a>
              .
            </p>
          </div>
        )}
        <div
          {...getRootProps()}
          className={cn(
            "p-4 border-t bg-background relative",
            isDragActive && "bg-muted",
            "before:content-['']",
            "before:absolute before:inset-[2px]",
            "before:border-2 before:border-dashed before:border-black before:rounded-md",
            "before:opacity-0 before:transition-opacity",
            isDragActive && "before:opacity-100"
          )}
        >
          <div
            className={cn(
              "relative z-10",
              isDragActive && "pointer-events-none"
            )}
          >
            <form onSubmit={handleSend} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 relative">
                <Input
                  placeholder={t("Type your message...")}
                  value={input}
                  onChange={handleInputChange}
                  className="flex-1 sm:text-sm text-base"
                  ref={inputRef}
                  autoFocus
                  disabled={isLimitReached && !userApiKey && !isSubscribed}
                  aria-hidden="false"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileInputChange}
                  accept=".pdf,.docx,.txt,.md"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="end">
                      <p>{t("Attach document")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="submit"
                        size="icon"
                        className="bg-[#3675F1] hover:bg-[#2556E4]"
                        disabled={
                          isLoading ||
                          (isLimitReached && !userApiKey && !isSubscribed) ||
                          !input.trim()
                        }
                      >
                        <Send className="h-4 w-4 text-white" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="end">
                      <p>{t("Send message")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </form>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              {t(
                "Briefcase can make mistakes. Please check important info with a lawyer."
              )}
            </div>
          </div>
        </div>
      </div>
      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("Get Quote")}</DialogTitle>
            <DialogDescription>
              {t(
                "Submit a question to see how much it would cost to consult a lawyer"
              )}
            </DialogDescription>
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
      {isSubscriptionVerified && (
        <SettingsDialog
          open={isSettingsOpen}
          onOpenChange={handleSettingsOpenChange}
          onNameChange={handleNameChange}
          onApiKeyChange={handleApiKeyChange}
          isSubscribed={isSubscribed}
          onSubscriptionChange={handleSubscriptionChange}
          initialTab={settingsInitialTab}
        />
      )}
      <KeyboardShortcuts
        sortedConversations={groupedConversations.flatMap(
          (group) => group.conversations
        )}
        currentConversationId={currentConversationId}
        onConversationSelect={handleConversationSelect}
        isSidebarOpen={isSidebarOpen}
        isCommandMenuOpen={isCommandMenuOpen}
      />
      <CommandMenu
        onSettingsOpen={() => setIsSettingsOpen(true)}
        onThemeToggle={() => setTheme(theme === "light" ? "dark" : "light")}
        onNewChat={startNewChat}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        currentTheme={theme}
        isOpen={isCommandMenuOpen}
        onOpenChange={setIsCommandMenuOpen}
      />
    </div>
  );
}
