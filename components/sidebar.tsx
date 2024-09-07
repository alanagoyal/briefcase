"use client";

import { useI18n } from "@quetzallabs/i18n";
import { useState } from "react";
import { Button } from "./ui/button";
import { Settings, Trash2 } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Conversation } from "../types/chat";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import { Header } from "./header";
interface SidebarProps {
  groupedConversations: {
    title: string;
    conversations: Conversation[];
  }[];
  currentConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onConversationDelete: (id: string) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  isLoading: boolean;
  isMobile: boolean | null;
  closeSidebar: () => void; 
}
export default function Sidebar({
  groupedConversations,
  currentConversationId,
  onConversationSelect,
  onConversationDelete,
  onNewChat,
  onToggleSidebar,
  onOpenSettings,
  isLoading,
  isMobile,
  closeSidebar, 
}: SidebarProps) {
  const { t } = useI18n();
  const [hoveredConversationId, setHoveredConversationId] = useState<
    string | null
  >(null);
  const handleNewChat = () => {
    onNewChat();
    if (isMobile) {
      closeSidebar(); 
    }
  };
  return (
    <div
      className={`${
        isMobile ? "w-full" : "w-64 border-r"
      } flex flex-col h-full bg-background`}
    >
      <Header
        toggleSidebar={onToggleSidebar}
        startNewChat={handleNewChat}
        isSidebarOpen={true}
      />
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          // Skeleton loader
          <div className="flex flex-col h-full space-y-4 p-2">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : groupedConversations.length === 0 ? (
          // Empty state
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">{t("No conversations")}</p>
          </div>
        ) : (
          // Actual conversations
          <div className="space-y-4 p-2">
            {groupedConversations.map((group) => (
              <div key={group.title}>
                <h2 className="text-sm font-semibold mb-2">{group.title}</h2>
                <div className="space-y-1">
                  {group.conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`relative p-2 cursor-pointer rounded-md ${
                        conv.id === currentConversationId
                          ? "bg-[#3675F1] text-white"
                          : ""
                      }`}
                      onClick={() => onConversationSelect(conv.id)}
                      onMouseEnter={() => setHoveredConversationId(conv.id)}
                      onMouseLeave={() => setHoveredConversationId(null)}
                    >
                      <div className="absolute inset-0 flex items-center">
                        <span className="text-sm truncate w-full px-2 mr-5">
                          {conv.title}
                        </span>
                      </div>
                      <div className="relative z-10 flex justify-end">
                        <Button
                          variant="ghost-no-hover"
                          size="icon"
                          className={cn(
                            "h-6 w-6",
                            conv.id === currentConversationId ||
                              conv.id === hoveredConversationId
                              ? "opacity-100"
                              : "opacity-0",
                            "transition-opacity hover:text-red-500"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onConversationDelete(conv.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col space-y-1">
        <ThemeToggle />
        <Button
          variant="ghost"
          className="justify-start"
          onClick={onOpenSettings}
        >
          <Settings className="mr-2 h-5 w-5" />
          {t("Settings")}
        </Button>
      </div>
    </div>
  );
}
