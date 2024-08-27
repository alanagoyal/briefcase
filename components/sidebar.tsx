import {
  History,
  Settings,
  LogOut,
  Trash2,
  ChevronDown,
  ChevronRight,
  PenSquare,
  Columns2,
} from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Message } from "ai/react";

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
}

interface SidebarProps {
  documents: Document[];
  conversations: Conversation[];
  currentConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onConversationDelete: (id: string) => void;
  onDocumentDelete: (id: string) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

export default function Sidebar({
  documents,
  conversations,
  currentConversationId,
  onConversationSelect,
  onConversationDelete,
  onDocumentDelete,
  onNewChat,
  onToggleSidebar
}: SidebarProps) {
  const [conversationsOpen, setConversationsOpen] = useState(true);
  const [documentsOpen, setDocumentsOpen] = useState(true);

  return (
    <div className="w-64 bg-muted flex flex-col h-full">
      <div className="p-4 flex justify-between items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label="Close sidebar"
        >
          <Columns2 className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          aria-label="New chat"
        >
          <PenSquare className="h-5 w-5" />
        </Button>
      </div>
      <div className="p-4 flex-grow overflow-y-auto">
        <div className="pr-3">
          <div className="mb-2">
            <Button
              variant="ghost"
              className="w-full justify-between mb-2"
              onClick={() => setConversationsOpen(!conversationsOpen)}
            >
              <span className="font-semibold">Conversations</span>
              {conversationsOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            {conversationsOpen && (
              <div className="mb-2 ml-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`flex items-center p-2 hover:bg-muted-foreground/10 cursor-pointer ${
                      conv.id === currentConversationId
                        ? "bg-muted-foreground/20"
                        : ""
                    }`}
                    onClick={() => onConversationSelect(conv.id)}
                  >
                    <History className="h-4 w-4 min-w-[16px] mr-2" />
                    <span className="text-sm truncate flex-grow mr-2">
                      {conv.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
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
            )}
          </div>

          <div className="mb-2">
            <Button
              variant="ghost"
              className="w-full justify-between mb-2"
              onClick={() => setDocumentsOpen(!documentsOpen)}
            >
              <span className="font-semibold">Documents</span>
              {documentsOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            {documentsOpen && (
              <div className="mb-2 ml-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center p-2 hover:bg-muted-foreground/10"
                  >
                    <span className="text-sm truncate flex-grow mr-2">
                      {doc.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => onDocumentDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Button variant="ghost" className="mt-4 mb-2 justify-start">
        <Settings className="mr-2 h-4 w-4" /> Settings
      </Button>
      <Button variant="ghost" className="justify-start text-red-500">
        <LogOut className="mr-2 h-4 w-4" /> Log Out
      </Button>
    </div>
  );
}
