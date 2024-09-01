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

interface SidebarProps {
  groupedConversations: { title: string; conversations: Conversation[] }[];
  currentConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onConversationDelete: (id: string) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
}

export default function Sidebar({
  groupedConversations,
  currentConversationId,
  onConversationSelect,
  onConversationDelete,
  onNewChat,
  onToggleSidebar,
  onOpenSettings,
}: SidebarProps) {
  const [hoveredConversationId, setHoveredConversationId] = useState<string | null>(null);

  return (
    <div className="w-64 flex flex-col h-full border">
      <div className="p-2 flex justify-between items-center">
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
            <TooltipContent>
              <p>Close sidebar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNewChat}
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
      </div>
      <div className="p-2 flex-grow overflow-y-auto">
        <h1 className="text-2xl font-bold ml-2 mb-4 text-[#3675F1] font-['Avenir'] flex items-center">
          Briefcase
        </h1>
        <div className="mb-2 ml-2">
          {groupedConversations.map((group) => (
            <div key={group.title} className="mb-4">
              <h2 className="text-sm font-semibold mb-2">{group.title}</h2>
              {group.conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center p-2 cursor-pointer rounded-md ${
                    conv.id === currentConversationId
                      ? "bg-[#3675F1] text-white"
                      : ""
                  }`}
                  onClick={() => onConversationSelect(conv.id)}
                  onMouseEnter={() => setHoveredConversationId(conv.id)}
                  onMouseLeave={() => setHoveredConversationId(null)}
                >
                  <span className="text-sm truncate flex-grow mr-2">
                    {conv.title.length > 30 ? conv.title.slice(0, 30) + '...' : conv.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 flex-shrink-0 ${
                      conv.id === currentConversationId || conv.id === hoveredConversationId ? "opacity-100" : "opacity-0"
                    } transition-opacity`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onConversationDelete(conv.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </div>
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
