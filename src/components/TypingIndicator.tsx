export const TypingIndicator = () => {
  return (
    <div className="flex w-full mb-4 animate-fade-in">
      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-card border border-border shadow-md">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
};
