import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { User, Scale, Zap, CircleDot, ChevronDown, Copy, Check } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export interface MessageProps {
  role: "user" | "assistant";
  content: string;
  model?: string;
  ai_metadata?: {
    strategy: "model" | "effort";
    reasoning_effort: string;
    complexity_detected: boolean;
    estimated_cost: number;
    tokens_used: number;
  };
}

function parseThinking(content: string): { thinking: string | null; cleanContent: string } {
  const thinkingMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/);
  if (thinkingMatch) {
    const thinking = thinkingMatch[1].trim();
    const cleanContent = content.replace(/<thinking>[\s\S]*?<\/thinking>\s*/g, "").trim();
    return { thinking, cleanContent };
  }
  return { thinking: null, cleanContent: content };
}

export function ChatMessage({ role, content, model, ai_metadata }: MessageProps) {
  const isUser = role === "user";
  const { thinking, cleanContent } = parseThinking(content);
  const [thinkingExpanded, setThinkingExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(cleanContent);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={cn(
        "flex w-full gap-4 p-4 rounded-lg transition-colors",
        isUser ? "bg-muted/50" : "bg-background border border-border/50"
      )}
    >
      <Avatar className={cn("h-8 w-8 flex items-center justify-center", isUser ? "bg-primary" : "bg-accent")}>
        {isUser ? <User className="h-5 w-5 text-primary-foreground" /> : <Scale className="h-5 w-5 text-accent-foreground" />}
      </Avatar>
      <div className="flex-1 space-y-2 max-w-[calc(100%-3rem)]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{isUser ? "You" : "Juristiq AI"}</span>
            {!isUser && (
              <span className="text-xs bg-accent/20 text-accent-foreground px-1.5 py-0.5 rounded-full">Legal Assistant</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => void copyMessage()}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {!isUser && thinking && (
          <details
            className="group mb-3"
            open={thinkingExpanded}
            onToggle={(e) => setThinkingExpanded((e.target as HTMLDetailsElement).open)}
          >
            <summary className="cursor-pointer flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className={cn("h-3 w-3 transition-transform", thinkingExpanded && "rotate-180")} />
              <span className="font-medium">View reasoning process</span>
            </summary>
            <div className="mt-2 p-3 bg-muted/30 rounded-md border border-border/30 text-xs text-muted-foreground whitespace-pre-wrap font-mono relative">
              <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-accent/40 rounded-l-md" />
              {thinking}
            </div>
          </details>
        )}

        <div className={cn("text-sm leading-relaxed text-foreground/90", isUser && "whitespace-pre-wrap")}>
          {isUser ? (
            cleanContent
          ) : (
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              remarkPlugins={[remarkGfm]}
              components={{
                h3: ({ ...props }) => (
                  <h3 className="text-lg font-serif font-bold text-primary mt-6 mb-2 border-b border-border pb-1" {...props} />
                ),
                h4: ({ ...props }) => (
                  <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mt-4 mb-2" {...props} />
                ),
                strong: ({ ...props }) => (
                  <strong className="font-bold text-foreground bg-accent/10 px-0.5 rounded text-[0.95em]" {...props} />
                ),
                ul: ({ ...props }) => <ul className="list-disc pl-5 space-y-1 my-2" {...props} />,
                ol: ({ ...props }) => <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />,
                p: ({ children, ...props }) => {
                  return (
                    <p className="mb-3 last:mb-0" {...props}>
                      {children}
                    </p>
                  );
                },
              }}
            >
              {cleanContent}
            </ReactMarkdown>
          )}
        </div>

        {!isUser && ai_metadata && (
          <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground border-t border-border/30 mt-2">
            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
              <Zap className="h-3 w-3" />
              <span className="font-mono">{model}</span>
              {ai_metadata.reasoning_effort !== "none" && (
                <>
                  <CircleDot className="h-2 w-2 mx-0.5" />
                  <span>{ai_metadata.reasoning_effort}</span>
                </>
              )}
              <span className="ml-1 text-muted-foreground/60">· ~${ai_metadata.estimated_cost.toFixed(4)}</span>
            </div>
            {ai_metadata.complexity_detected && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Complex query detected</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
