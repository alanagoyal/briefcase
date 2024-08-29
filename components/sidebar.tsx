import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import {
  Settings,
  Trash2,
  PenSquare,
  Columns2,
  Briefcase,
} from "lucide-react";
import { Message } from "ai/react";
import { isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import { ThemeToggle } from "./theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onConversationDelete: (id: string) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

interface ConversationGroup {
  title: string;
  conversations: Conversation[];
}

export default function Sidebar({
  conversations,
  currentConversationId,
  onConversationSelect,
  onConversationDelete,
  onNewChat,
  onToggleSidebar,
}: SidebarProps) {
  const [hoveredConversationId, setHoveredConversationId] = useState<string | null>(null);

  const groupedConversations = useMemo(() => {
    const groups: ConversationGroup[] = [
      { title: "Today", conversations: [] },
      { title: "Yesterday", conversations: [] },
      { title: "This Week", conversations: [] },
      { title: "This Month", conversations: [] },
      { title: "Older", conversations: [] },
    ];

    conversations.forEach((conv) => {
      const lastMessageDate =
        conv.messages.length > 0
          ? new Date(
              conv.messages[conv.messages.length - 1].createdAt ||
                conv.createdAt
            )
          : conv.createdAt;

      if (isToday(lastMessageDate)) {
        groups[0].conversations.push(conv);
      } else if (isYesterday(lastMessageDate)) {
        groups[1].conversations.push(conv);
      } else if (isThisWeek(lastMessageDate)) {
        groups[2].conversations.push(conv);
      } else if (isThisMonth(lastMessageDate)) {
        groups[3].conversations.push(conv);
      } else {
        groups[4].conversations.push(conv);
      }
    });

    // Sort conversations within each group by createdAt date (most recent first)
    groups.forEach(group => {
      group.conversations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    });

    return groups.filter((group) => group.conversations.length > 0);
  }, [conversations]);

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
                <Columns2 className="h-5 w-5" />
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
          {groupedConversations.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-4">
              <h3 className="text-sm font-semibold mb-2">{group.title}</h3>
              {group.conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center p-2 cursor-pointer rounded-md ${
                    conv.id === currentConversationId
                      ? "bg-[#3675F1] text-white"
                      : ""
                  }`}
                  onClick={() => onConversationSelect(conv.id)}
                >
                  <span className="text-sm truncate flex-grow mr-2">
                    {conv.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 flex-shrink-0 ${
                      conv.id === currentConversationId ? "opacity-100" : "opacity-0 hover:opacity-100"
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
        <Button variant="ghost" className="justify-start">
          <Settings className="mr-2 h-5 w-5" /> Settings
        </Button>
      </div>
    </div>
  );
}
