"use client";

import {  useI18n } from "@quetzallabs/i18n";
import { useEffect } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Settings,
  Sun,
  Moon,
  PanelLeftOpen,
  PanelLeftClose,
  PenSquare,
} from "lucide-react";
interface CommandMenuProps {
  onSettingsOpen: () => void;
  onThemeToggle: () => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  currentTheme: string | undefined;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}
export default function CommandMenu({
  onSettingsOpen,
  onThemeToggle,
  onNewChat,
  onToggleSidebar,
  isSidebarOpen,
  currentTheme,
  isOpen,
  onOpenChange,
}: CommandMenuProps) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!isOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, onOpenChange]);
  const { t } = useI18n();
  const commands = [
    {
      name: t("Settings"),
      icon: <Settings className="h-4 w-4" />,
      action: () => {
        onSettingsOpen();
        onOpenChange(false);
      },
    },
    {
      name: t("Toggle Theme"),
      icon:
        currentTheme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        ),
      action: () => {
        onThemeToggle();
        onOpenChange(false);
      },
    },
    {
      name: t("New Chat"),
      icon: <PenSquare className="h-4 w-4" />,
      action: () => {
        onNewChat();
        onOpenChange(false);
      },
    },
    {
      name: isSidebarOpen ? t("Close Sidebar") : t("Open Sidebar"),
      icon: isSidebarOpen ? (
        <PanelLeftClose className="h-4 w-4" />
      ) : (
        <PanelLeftOpen className="h-4 w-4" />
      ),
      action: () => {
        onToggleSidebar();
        onOpenChange(false);
      },
    },
  ];
  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTitle className="hidden">{t("Command Menu")}</DialogTitle>
      <DialogDescription className="hidden">
        {t("Search for commands or use the suggestions below.")}
      </DialogDescription>
      <CommandInput placeholder={t("Type a command or search...")} />
      <CommandList>
        <CommandEmpty>{t("No results found.")}</CommandEmpty>
        <CommandGroup heading={t("Suggestions")}>
          {commands.map((command) => (
            <CommandItem key={command.name} onSelect={command.action}>
              {command.icon}
              <span className="ml-2">{command.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
