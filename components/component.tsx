"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Menu,
  MessageSquare,
  PenSquare,
  Plus,
  Send,
  Settings,
  UploadCloud,
} from "lucide-react";
import { ChangeEvent, KeyboardEvent } from "react";
import { useChat } from "ai/react";
export default function Component() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversationsOpen, setConversationsOpen] = useState(true);
  const [documentsOpen, setDocumentsOpen] = useState(true);
  const [conversations, setConversations] = useState<Array<{ id: number; name: string }>>([
    {
      id: 1,
      name: "What are the legal implications of pro rata rights in fundraising?",
    },
    {
      id: 2,
      name: "Legal considerations for Side Letter Agreements in startup funding",
    },
    {
      id: 3,
      name: "Regulatory compliance in SAFE (Simple Agreement for Future Equity) notes",
    },
    { id: 4, name: "Legal risks of crowdfunding for startups" },
    {
      id: 5,
      name: "Intellectual property protection during fundraising pitches",
    },
    { id: 6, name: "Securities laws applicable to different funding rounds" },
  ]);
  const [documents, setDocuments] = useState<Array<{ id: number; name: string }>>([
    { id: 1, name: "TechNova Ventures Funding Proposal.pdf" },
    { id: 2, name: "GreenSpark Solutions Series A Term Sheet.docx" },
    { id: 3, name: "Quantum Dynamics Seed Round Pitch Deck.txt" },
  ]);

  const { messages, input, handleInputChange, handleSubmit } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleConversations = () => {
    setConversationsOpen(!conversationsOpen);
  };

  const toggleDocuments = () => {
    setDocumentsOpen(!documentsOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`bg-muted transition-all duration-300 ${sidebarOpen ? "w-64" : "w-0"}`}>
        {sidebarOpen && (
          <div className="h-full flex flex-col">
            {/* Top buttons - always visible */}
            <div className="p-4 flex justify-between items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="New chat">
                <PenSquare className="h-5 w-5" />
              </Button>
            </div>

            {/* Scrollable content area */}
            <ScrollArea className="flex-1 px-4">
              <div>
                <Button
                  variant="ghost"
                  className="w-full justify-start mb-2 text-sm font-medium"
                  onClick={toggleConversations}
                >
                  Conversations
                </Button>
                {conversationsOpen && (
                  <div className="space-y-1 ml-2">
                    {conversations.map((conv) => (
                      <Button
                        key={conv.id}
                        variant="ghost"
                        className="w-full justify-start text-sm font-normal"
                      >
                        {conv.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              <Separator className="my-4" />
              <div>
                <Button
                  variant="ghost"
                  className="w-full justify-start mb-2 text-sm font-medium"
                  onClick={toggleDocuments}
                >
                  Documents
                </Button>
                {documentsOpen && (
                  <div className="space-y-1 ml-2">
                    {documents.map((doc) => (
                      <Button
                        key={doc.id}
                        variant="ghost"
                        className="w-full justify-start text-sm font-normal"
                      >
                        {doc.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Bottom button - always visible */}
            <div className="p-4">
              <Button variant="ghost" className="w-full justify-start text-sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-background border-b p-2 flex justify-between items-center">
          <div className="flex items-center">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
          <div className="flex-1 flex justify-center">
            <Button variant="ghost" size="sm" className="text-md font-medium">
              Briefcase
            </Button>
          </div>
          <div className="flex items-center"></div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-auto p-4">
          <ScrollArea className="h-full">
            {messages.map((message: any) => (
              <div
                key={message.id}
                className={`mb-4 flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                  style={{ maxWidth: "80%" }}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 bg-background border-t">
          <div className="flex items-center max-w-3xl mx-auto">
            <Input
              placeholder="Ask a legal question..."
              value={input}
              onChange={handleInputChange}
              className="flex-1"
            />
            <Button type="submit" className="ml-2" aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-center mt-2 text-muted-foreground">
            This AI legal assistant provides general information. Always consult with a qualified attorney for specific legal advice.
          </p>
        </form>
      </div>
    </div>
  );
}