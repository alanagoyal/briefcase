import { Plus, History, Settings, LogOut, File, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface SidebarProps {
  documents: { name: string; type: string; size: number }[];
  conversations: { id: string; title: string }[];
  currentConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onConversationDelete: (id: string) => void;
  onDocumentDelete: (index: number) => void;
  onNewChat: () => void;
}

export default function Sidebar({
  documents,
  conversations,
  currentConversationId,
  onConversationSelect,
  onConversationDelete,
  onDocumentDelete,
  onNewChat
}: SidebarProps) {
  return (
    <div className="w-64 bg-muted p-4 flex flex-col">
      <div className="flex items-center mb-8">
        <span className="ml-2 text-xl font-bold">Briefcase</span>
      </div>

      <Button variant="outline" className="mb-4 justify-start" onClick={onNewChat}>
        <Plus className="mr-2 h-4 w-4" /> New Chat
      </Button>

      <div className="mb-4 ml-2">
        <h2 className="font-semibold mb-2">Conversations</h2>
        <ScrollArea className="h-48 w-full rounded-md">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`flex items-center p-2 hover:bg-muted-foreground/10 cursor-pointer ${
                conv.id === currentConversationId ? 'bg-muted-foreground/20' : ''
              }`}
              onClick={() => onConversationSelect(conv.id)}
            >
              <History className="h-4 w-4 mr-2" />
              <span className="text-sm truncate flex-grow">{conv.title}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onConversationDelete(conv.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </ScrollArea>
      </div>

      <div className="mb-4 ml-2">
        <h2 className="font-semibold mb-2">Documents</h2>
        <ScrollArea className="h-48 w-full rounded-md">
          {documents.map((file, index) => (
            <div
              key={index}
              className="flex items-center p-2 hover:bg-muted-foreground/10"
            >
              <File className="h-4 w-4 mr-2" />
              <span className="text-sm truncate flex-grow">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDocumentDelete(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </ScrollArea>
      </div>

      <div className="flex-grow" />
      <Button variant="ghost" className="mb-2 justify-start">
        <Settings className="mr-2 h-4 w-4" /> Settings
      </Button>
      <Button variant="ghost" className="justify-start text-red-500">
        <LogOut className="mr-2 h-4 w-4" /> Log Out
      </Button>
    </div>
  );
}