import { Plus, History, Settings, LogOut, File } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface SidebarProps {
  documents: File[];
}

export default function Sidebar({ documents }: SidebarProps) {
  return (
    <div className="w-64 bg-muted p-4 flex flex-col">
      <div className="flex items-center mb-8">
        <span className="ml-2 text-xl font-bold">LegalAI</span>
      </div>

      {/* Documents Section */}
      <div className="mb-4 ml-2">
        <h2 className="font-semibold mb-2">Documents</h2>
        <ScrollArea className="h-48 w-full rounded-md">
          {documents.length > 0 ? (
            documents.map((file, index) => (
              <div
                key={index}
                className="flex items-center p-2 hover:bg-muted-foreground/10"
              >
                <File className="h-4 w-4 mr-2" />
                <span className="text-sm truncate">{file.name}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground p-2">
              No documents uploaded
            </p>
          )}
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
