import { Plus, MessageSquare, Trash2, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const ChatSidebar = ({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  theme,
  onToggleTheme,
}: ChatSidebarProps) => {
  return (
    <div className="w-64 h-screen bg-sidebar-background border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          PejuangBot 💬
        </h1>
        <Button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
        >
          <Plus className="mr-2 h-4 w-4" />
          Chat Baru
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-sidebar-accent transition-colors",
                currentConversationId === conv.id && "bg-sidebar-accent"
              )}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MessageSquare className="h-4 w-4 flex-shrink-0 text-sidebar-primary" />
                <span className="text-sm truncate">{conv.title}</span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleTheme}
          className="w-full"
        >
          {theme === "light" ? (
            <>
              <Moon className="mr-2 h-4 w-4" />
              Mode Gelap
            </>
          ) : (
            <>
              <Sun className="mr-2 h-4 w-4" />
              Mode Terang
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
