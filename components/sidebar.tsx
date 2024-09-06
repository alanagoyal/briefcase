"use client"

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Settings,
  Trash2,
  PenSquare,
  PanelLeftClose,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Conversation } from "../types/chat";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

interface SidebarProps {
  groupedConversations: { title: string; conversations: Conversation[] }[];
  currentConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onConversationDelete: (id: string) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  isLoading: boolean; 
  isMobile: boolean | null;
  closeSidebar: () => void; // Add this new prop
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
  closeSidebar, // Add this new prop
}: SidebarProps) {
  const [hoveredConversationId, setHoveredConversationId] = useState<string | null>(null);

  const handleNewChat = () => {
    onNewChat();
    if (isMobile) {
      closeSidebar(); // Close the sidebar on mobile when starting a new chat
    }
  };

  return (
    <div className={`${isMobile ? 'w-full' : 'w-64'} flex flex-col h-full border bg-background`}>
      <div className="p-2 flex justify-between items-center">
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleSidebar}
                  aria-label="Close sidebar"
                >
                  <PanelLeftClose className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start">
                <p>Close sidebar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {isMobile && (
            <h1 className="text-2xl font-bold text-[#3675F1] font-['Avenir'] ml-2">
              Briefcase
            </h1>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewChat}
                aria-label="New chat"
              >
                <PenSquare className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>New chat</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex-grow overflow-y-auto">
        {!isMobile && (
          <h1 className="text-2xl font-bold mb-4 text-[#3675F1] font-['Avenir'] flex items-center px-2">
            Briefcase
          </h1>
        )}
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
                            conv.id === currentConversationId || conv.id === hoveredConversationId ? "opacity-100" : "opacity-0",
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
          <Settings className="mr-2 h-5 w-5" /> Settings
        </Button>
      </div>
    </div>
  );
}
