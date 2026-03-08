import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = "Ask a legal question..." }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = !!input.trim() && !disabled && !sending;

  const resizeInput = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  useEffect(() => {
    resizeInput();
  }, [input]);

  const handleSend = async () => {
    const message = input.trim();
    if (!message || !canSend) return;

    setSending(true);
    try {
      await onSend(message);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSend();
    }
  };

  return (
    <div className="relative flex items-end gap-2 p-4 bg-background border-t">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => void handleKeyDown(e)}
        placeholder={placeholder}
        disabled={disabled || sending}
        rows={1}
        className="flex-1 min-h-[44px] max-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden"
      />
      <Button onClick={() => void handleSend()} disabled={!canSend} size="icon" className="mb-0.5 shrink-0">
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
}
