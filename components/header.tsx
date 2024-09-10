import { useI18n } from "@quetzallabs/i18n";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PenSquare,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
export const Header = ({
  toggleSidebar,
  startNewChat,
  isSidebarOpen,
}: {
  toggleSidebar: () => void;
  startNewChat: () => void;
  isSidebarOpen: boolean;
}) => {
  const { t } = useI18n();
  return (
    <div className="p-2 bg-background flex items-center justify-between">
      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                aria-label={
                  isSidebarOpen ? t("Close sidebar") : t("Open sidebar")
                }
              >
                {isSidebarOpen ? (
                  <PanelLeftClose className="h-5 w-5" />
                ) : (
                  <PanelLeftOpen className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start">
              <p>{isSidebarOpen ? t("Close sidebar") : t("Open sidebar")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <h1 className="text-2xl font-bold text-[#3675F1] font-['Avenir'] flex items-center">
          Briefcase
        </h1>
      </div>
      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={startNewChat}
                aria-label={t("New chat")}
              >
                <PenSquare className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{t("New chat")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
