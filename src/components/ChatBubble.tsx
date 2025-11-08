import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export const ChatBubble = ({ role, content }: ChatBubbleProps) => {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full mb-4 animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-md",
          isUser
            ? "bg-gradient-to-br from-primary via-secondary to-accent text-primary-foreground"
            : "bg-card text-card-foreground border border-border"
        )}
        style={isUser ? { boxShadow: "var(--shadow-glow)" } : {}}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {content}
        </p>
      </div>
    </div>
  );
};
