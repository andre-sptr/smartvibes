import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ boxShadow: "var(--shadow-glow)" }}
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik sesuatu... aku siap bantu 🤙"
          disabled={disabled}
          className="min-h-[60px] max-h-[200px] pr-14 resize-none bg-card border-2 border-primary/20 focus:border-primary/40 rounded-2xl focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || disabled}
          className="absolute right-2 bottom-2 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};
