"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, BrainCircuit } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { ChatInput } from "./chat-input";
import { ChatMessage, MessageProps } from "./chat-message";
import { FileUpload } from "./file-upload";
import { generateDocument, sendMessage, uploadFile } from "@/lib/api";
import { ReasoningEffort, useSessionConfig } from "@/lib/session-config";
import { getThreadHistory } from "@/lib/workspace-api";

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return "Failed to get response.";
};

const INITIAL_ASSISTANT_MESSAGE: MessageProps = {
  role: "assistant",
  content: "Welcome to Juristiq. Ask your legal question and I will respond using your selected controls.",
};

export function ChatWindow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    modelTier,
    outputTone,
    showThinking,
    stepByStep,
    citeAuthorities,
    reasoningEffort,
    setReasoningEffort,
  } = useSessionConfig();

  const [messages, setMessages] = useState<MessageProps[]>([INITIAL_ASSISTANT_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const jurisdiction = "NZ";
  const category = "general";
  const [deepAnalysis, setDeepAnalysis] = useState<boolean>(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const activeThreadId = useMemo(() => {
    const raw = searchParams.get("thread");
    if (!raw) return undefined;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [searchParams]);

  const scrollToBottom = () => {
    if (!scrollRef.current) return;
    const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let cancelled = false;

    const loadThread = async () => {
      if (!activeThreadId) {
        setChatId(undefined);
        setMessages([INITIAL_ASSISTANT_MESSAGE]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const history = await getThreadHistory(activeThreadId);
        if (cancelled) return;

        setChatId(activeThreadId);
        setMessages(
          history.length
            ? history.map((item) => ({ role: item.role, content: item.content }))
            : [
                {
                  role: "assistant",
                  content: "This thread is ready. Ask a legal question to begin.",
                },
              ]
        );
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
          setMessages([INITIAL_ASSISTANT_MESSAGE]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadThread();

    return () => {
      cancelled = true;
    };
  }, [activeThreadId]);

  const notifyThreadsChanged = () => {
    window.dispatchEvent(new Event("juristiq:threads-changed"));
  };

  const handleSend = async (text: string) => {
    const userMsg: MessageProps = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const res = await sendMessage(
        text,
        chatId,
        jurisdiction,
        category,
        deepAnalysis,
        reasoningEffort === "auto" ? undefined : reasoningEffort,
        {
          modelTier,
          outputTone,
          showThinking,
          stepByStep,
          citeAuthorities,
        }
      );

      if (!res.error && res.answer) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.answer,
            model: res.model,
            ai_metadata: res.ai_metadata,
          },
        ]);

        if (res.chat_id) {
          setChatId(res.chat_id);
          if (!activeThreadId || activeThreadId !== res.chat_id) {
            router.replace(`/dashboard?thread=${res.chat_id}`);
          }
          notifyThreadsChanged();
        }
      } else {
        throw new Error(res.error || "Unknown error");
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full w-full max-w-5xl mx-auto shadow-xl border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="bg-primary px-4 py-3 text-primary-foreground flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
          <span className="font-semibold tracking-wide">
            Juristiq Live Session <span className="text-primary-foreground/60 text-sm font-normal">| {jurisdiction} • {category}</span>
          </span>
          {deepAnalysis ? (
            <Badge variant="secondary" className="bg-accent/20 text-accent-foreground text-[10px] h-5 border-none">
              Deep Mode
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1 bg-secondary/30 rounded-md p-0.5 border border-border/50">
              <button
                onClick={async () => {
                  const lastAssistantMsg = messages.filter((m) => m.role === "assistant").pop();
                  if (!lastAssistantMsg) return;

                  try {
                    const res = await generateDocument("Legal Document", lastAssistantMsg.content, "docx");
                    if (res.ok && res.downloadUrl) {
                      window.location.href = res.downloadUrl;
                    }
                  } catch {
                    setError("Failed to generate DOCX");
                  }
                }}
                className="text-[10px] font-medium px-2 py-1 rounded hover:bg-background/80 transition-colors text-muted-foreground hover:text-foreground"
                title="Download as Word"
              >
                DOCX
              </button>
              <div className="w-[1px] h-3 bg-border/50" />
              <button
                onClick={async () => {
                  const lastAssistantMsg = messages.filter((m) => m.role === "assistant").pop();
                  if (!lastAssistantMsg) return;

                  try {
                    const res = await generateDocument("Legal Document", lastAssistantMsg.content, "pdf");
                    if (res.ok && res.downloadUrl) {
                      window.location.href = res.downloadUrl;
                    }
                  } catch {
                    setError("Failed to generate PDF");
                  }
                }}
                className="text-[10px] font-medium px-2 py-1 rounded hover:bg-background/80 transition-colors text-muted-foreground hover:text-foreground"
                title="Download as PDF"
              >
                PDF
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="effort-select" className="text-[9px] font-medium uppercase tracking-tighter">
              Think:
            </Label>
            <select
              id="effort-select"
              value={reasoningEffort}
              onChange={(event) => setReasoningEffort(event.target.value as ReasoningEffort)}
              className="bg-black/10 text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded border border-white/10 cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="auto">Auto</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full border border-white/5">
            <BrainCircuit className={`h-3.5 w-3.5 ${deepAnalysis ? "text-accent" : "text-primary-foreground/40"}`} />
            <Label htmlFor="deep-toggle" className="text-[10px] font-bold uppercase tracking-tighter cursor-pointer">
              Deep Mode
            </Label>
            <Switch
              id="deep-toggle"
              checked={deepAnalysis}
              onCheckedChange={setDeepAnalysis}
              className="scale-75 data-[state=checked]:bg-accent"
            />
          </div>
          {chatId ? <span className="text-xs opacity-70">ID: {chatId}</span> : null}
        </div>
      </div>

      <div className="px-3 py-2 text-[11px] bg-amber-50 border-b border-amber-200 text-amber-900">
        Juristiq provides AI-assisted legal research support. Verify citations and professional obligations before relying on outputs.
      </div>

      <div className="bg-muted/30 border-b border-border/50 p-2">
        <FileUpload
          currentTier="ultra"
          isUploading={false}
          onFileSelect={async (file) => {
            try {
              setIsLoading(true);
              await uploadFile(file, "ultra");
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: `*File uploaded: ${file.name}*\nI have analyzed this document. What would you like to know?`,
                  model: "system",
                },
              ]);
            } catch (err) {
              setError(getErrorMessage(err));
            } finally {
              setIsLoading(false);
            }
          }}
        />
      </div>

      <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
        <div className="p-4 space-y-4 pb-4">
          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              role={msg.role}
              content={msg.content}
              model={msg.model}
              ai_metadata={msg.ai_metadata}
            />
          ))}

          {isLoading ? (
            <div className="flex items-center gap-2 p-4 text-muted-foreground animate-pulse">
              <div className="h-2 w-2 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="h-2 w-2 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="h-2 w-2 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="text-sm ml-2">Consulting legal database ({jurisdiction})...</span>
            </div>
          ) : null}

          {error ? (
            <div className="mx-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Error: {error}</span>
            </div>
          ) : null}
        </div>
      </ScrollArea>

      <ChatInput onSend={handleSend} disabled={isLoading} />
    </Card>
  );
}
