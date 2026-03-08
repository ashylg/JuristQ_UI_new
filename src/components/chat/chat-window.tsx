"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, BrainCircuit, Download, Loader2, RefreshCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { ChatInput } from "./chat-input";
import { ChatMessage, MessageProps } from "./chat-message";
import { FileUpload } from "./file-upload";
import { fetchGeneratedDocument, generateDocument, sendMessage, uploadFile } from "@/lib/api";
import { ReasoningEffort, useSessionConfig } from "@/lib/session-config";
import { getThreadHistory } from "@/lib/workspace-api";

type ChatMessageItem = MessageProps & { id: string };

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return "Failed to complete request.";
};

const INITIAL_ASSISTANT_MESSAGE: ChatMessageItem = {
  id: "initial",
  role: "assistant",
  content: "Welcome to Juristiq. Ask your legal question and I will respond using your selected controls.",
};

function makeMessageId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function safeFilename(base: string, ext: "docx" | "pdf"): string {
  const clean = base.replace(/[^a-z0-9-_ ]/gi, "").trim().replace(/\s+/g, "_") || "juristiq_document";
  return `${clean}.${ext}`;
}

function downloadBlob(filename: string, blob: Blob) {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(href);
}

function textAsBlob(content: string, format: "docx" | "pdf") {
  const mime =
    format === "pdf"
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return new Blob([content], { type: mime });
}

export function ChatWindow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { modelTier, outputTone, showThinking, stepByStep, citeAuthorities, reasoningEffort, setReasoningEffort } =
    useSessionConfig();

  const [messages, setMessages] = useState<ChatMessageItem[]>([INITIAL_ASSISTANT_MESSAGE]);
  const [isSending, setIsSending] = useState(false);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState<"docx" | "pdf" | null>(null);
  const [chatId, setChatId] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);

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

  const latestAssistantAnswer = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant" && message.id !== "initial"),
    [messages]
  );

  const scrollToBottom = () => {
    if (!scrollRef.current) return;
    const scrollContainer = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThreadLoading]);

  useEffect(() => {
    let cancelled = false;

    const loadThread = async () => {
      if (!activeThreadId) {
        setChatId(undefined);
        setMessages([INITIAL_ASSISTANT_MESSAGE]);
        setError(null);
        return;
      }

      setIsThreadLoading(true);
      setError(null);
      try {
        const history = await getThreadHistory(activeThreadId);
        if (cancelled) return;

        setChatId(activeThreadId);
        setMessages(
          history.length
            ? history.map((item, index) => ({
                id: `history_${activeThreadId}_${index}`,
                role: item.role,
                content: item.content,
              }))
            : [
                {
                  id: `thread_empty_${activeThreadId}`,
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
          setIsThreadLoading(false);
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
    const userMessage: ChatMessageItem = { id: makeMessageId("user"), role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLastPrompt(text);
    setIsSending(true);
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
            id: makeMessageId("assistant"),
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
        throw new Error(res.error || "Empty assistant response");
      }
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: makeMessageId("assistant_error"),
          role: "assistant",
          content: `I couldn't complete that request. ${message}`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const retryLastPrompt = async () => {
    if (!lastPrompt || isSending || isThreadLoading) return;
    await handleSend(lastPrompt);
  };

  const handleUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      const upload = await uploadFile(file, "ultra");
      setMessages((prev) => [
        ...prev,
        {
          id: makeMessageId("upload"),
          role: "assistant",
          content: `File uploaded successfully: **${upload.filename}** (${(upload.bytes / 1024).toFixed(
            1
          )} KB).\n\nI can now use this file as reference context in this thread.`,
          model: "system",
        },
      ]);
      notifyThreadsChanged();
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: makeMessageId("upload_error"),
          role: "assistant",
          content: `I couldn't upload that file. ${message}`,
          model: "system",
        },
      ]);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (format: "docx" | "pdf") => {
    if (!latestAssistantAnswer) return;

    setError(null);
    setIsDownloading(format);

    const defaultFilename = safeFilename("Legal Document", format);

    try {
      const generated = await generateDocument("Legal Document", latestAssistantAnswer.content, format);
      const blob = await fetchGeneratedDocument(generated.downloadUrl);
      downloadBlob(generated.filename || defaultFilename, blob);
      notifyThreadsChanged();
    } catch (err) {
      downloadBlob(defaultFilename, textAsBlob(latestAssistantAnswer.content, format));
      setError(`Unable to fetch generated ${format.toUpperCase()} file. Downloaded local fallback instead: ${getErrorMessage(err)}`);
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <Card className="flex flex-col h-full w-full max-w-5xl mx-auto shadow-xl border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="bg-primary px-4 py-3 text-primary-foreground flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
          <span className="font-semibold tracking-wide">
            Juristiq Live Session{" "}
            <span className="text-primary-foreground/60 text-sm font-normal">| {jurisdiction} • {category}</span>
          </span>
          {deepAnalysis ? (
            <Badge variant="secondary" className="bg-accent/20 text-accent-foreground text-[10px] h-5 border-none">
              Deep Mode
            </Badge>
          ) : null}
          {activeThreadId ? (
            <Badge variant="outline" className="text-[10px] bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
              Thread {activeThreadId}
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-7 text-[11px]"
              disabled={!latestAssistantAnswer || !!isDownloading}
              onClick={() => void handleDownload("docx")}
            >
              {isDownloading === "docx" ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
              DOCX
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-7 text-[11px]"
              disabled={!latestAssistantAnswer || !!isDownloading}
              onClick={() => void handleDownload("pdf")}
            >
              {isDownloading === "pdf" ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
              PDF
            </Button>
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
            <Switch id="deep-toggle" checked={deepAnalysis} onCheckedChange={setDeepAnalysis} className="scale-75 data-[state=checked]:bg-accent" />
          </div>
          {chatId ? <span className="text-xs opacity-70">ID: {chatId}</span> : null}
        </div>
      </div>

      <div className="px-3 py-2 text-[11px] bg-amber-50 border-b border-amber-200 text-amber-900">
        Juristiq provides AI-assisted legal research support. Verify citations and professional obligations before relying on outputs.
      </div>

      <div className="bg-muted/30 border-b border-border/50 p-2">
        <FileUpload currentTier="ultra" isUploading={isUploading} onUpload={handleUpload} />
      </div>

      <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
        <div className="p-4 space-y-4 pb-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} role={msg.role} content={msg.content} model={msg.model} ai_metadata={msg.ai_metadata} />
          ))}

          {isThreadLoading ? (
            <div className="flex items-center gap-2 p-4 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading thread history...</span>
            </div>
          ) : null}

          {isSending ? (
            <div className="flex items-center gap-2 p-4 text-muted-foreground animate-pulse">
              <div className="h-2 w-2 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="h-2 w-2 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="h-2 w-2 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="text-sm ml-2">Consulting legal database ({jurisdiction})...</span>
            </div>
          ) : null}

          {error ? (
            <div className="mx-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm flex flex-wrap items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="flex-1 min-w-[200px]">{error}</span>
              {lastPrompt && !isSending ? (
                <Button variant="outline" size="sm" className="h-7" onClick={() => void retryLastPrompt()}>
                  <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
                  Retry
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </ScrollArea>

      <ChatInput onSend={handleSend} disabled={isSending || isThreadLoading} />
    </Card>
  );
}
