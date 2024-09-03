"use client"

import { useEffect, useCallback } from 'react';
import { Conversation } from '../types/chat';

interface KeyboardShortcutsProps {
  sortedConversations: Conversation[];
  currentConversationId: string | null;
  onConversationSelect: (id: string) => void;
  isSidebarOpen: boolean;
  isCommandMenuOpen: boolean;
}

export function KeyboardShortcuts({
  sortedConversations,
  currentConversationId,
  onConversationSelect,
  isSidebarOpen,
  isCommandMenuOpen,
}: KeyboardShortcutsProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isSidebarOpen || isCommandMenuOpen) return;

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentIndex = sortedConversations.findIndex(
        (conv) => conv.id === currentConversationId
      );
      let newIndex;
      if (e.key === 'ArrowUp') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : sortedConversations.length - 1;
      } else {
        newIndex = currentIndex < sortedConversations.length - 1 ? currentIndex + 1 : 0;
      }
      onConversationSelect(sortedConversations[newIndex].id);
    }
  }, [sortedConversations, currentConversationId, onConversationSelect, isSidebarOpen, isCommandMenuOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null;
}