import { Message } from "ai/react";

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  documentContext?: string;
  documents?: Document[];
  lastMessageTimestamp?: number;
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
}

// Add these new types
export interface MessageFeedback {
  messageId: string;
  requestId: string;
  feedbackType: 'thumbsUp' | 'thumbsDown' | null;
}

export interface ExtendedMessage extends Message {
  requestId?: string;
  feedback?: MessageFeedback;
}