import { Plus, History, Settings, LogOut } from "lucide-react";
import { Button } from "./ui/button";

export default function Sidebar() {
    return (
    <div className="w-64 bg-muted p-4 flex flex-col">
    <div className="flex items-center mb-8">
      <svg
        className="h-8 w-8 text-primary"
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      </svg>
      <span className="ml-2 text-xl font-bold">LegalAI</span>
    </div>
    <Button variant="outline" className="mb-2 justify-start">
      <Plus className="mr-2 h-4 w-4" /> New Chat
    </Button>
    <Button variant="ghost" className="mb-2 justify-start">
      <History className="mr-2 h-4 w-4" /> History
    </Button>
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