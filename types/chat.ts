import { Message } from "ai/react";

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  documentContext?: string;
  documents?: Document[];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  conversationId: string;
}

export interface ConversationGroup {
    title: string;
    conversations: Conversation[];
  }