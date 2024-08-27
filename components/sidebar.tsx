import {
  Plus,
  History,
  Settings,
  LogOut,
  File,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";

// Add this placeholder data at the top of the file, outside the component
const placeholderConversations = [
  { id: "1", title: "Quick chat about project deadlines" },
  { id: "2", title: "AI ethics discussion" },
  { id: "3", title: "Brainstorming session for new features" },
  { id: "4", title: "Code review" },
  {
    id: "5",
    title:
      "Long conversation about the future of technology and its impact on society",
  },
];

const placeholderDocuments = [
  { name: "Project_proposal.docx", type: "document", size: 1024 },
  { name: "Budget_2023.xlsx", type: "spreadsheet", size: 2048 },
  { name: "Meeting_notes.txt", type: "text", size: 512 },
  { name: "Presentation_for_investors.pptx", type: "presentation", size: 4096 },
  {
    name: "Very_long_filename_with_detailed_description_of_contents.pdf",
    type: "document",
    size: 8192,
  },
];

interface SidebarProps {
  documents?: { name: string; type: string; size: number }[];
  conversations?: { id: string; title: string }[];
  currentConversationId?: string | null;
  onConversationSelect?: (id: string) => void;
  onConversationDelete?: (id: string) => void;
  onDocumentDelete?: (index: number) => void;
  onNewChat?: () => void;
}

export default function Sidebar({
  currentConversationId = null,
  onConversationSelect = () => {},
  onConversationDelete = () => {},
  onDocumentDelete = () => {},
  onNewChat = () => {},
}: SidebarProps) {
  const [conversationsOpen, setConversationsOpen] = useState(true);
  const [documentsOpen, setDocumentsOpen] = useState(true);

  return (
    <div className="w-64 bg-muted p-4 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <span className="ml-2 text-xl font-bold">Briefcase</span>
      </div>

      <Button
        variant="outline"
        className="mb-4 justify-start"
        onClick={onNewChat}
      >
        <Plus className="mr-2 h-4 w-4" /> New Chat
      </Button>

      <div className="flex-grow overflow-y-auto">
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
                {placeholderConversations.map((conv) => (
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
                {placeholderDocuments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center p-2 hover:bg-muted-foreground/10"
                  >
                    <File className="h-4 w-4 min-w-[16px] mr-2" />
                    <span className="text-sm truncate flex-grow mr-2">
                      {file.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => onDocumentDelete(index)}
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
