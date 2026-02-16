"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, MessageProps } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ConsultationIntake } from "./consultation-intake";
import { sendMessage, uploadFile, generateDocument } from "@/lib/api";
import { FileUpload } from "./file-upload";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { AlertCircle, BrainCircuit } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSessionConfig } from "@/lib/session-config";

export function ChatWindow() {
    const {
        modelTier,
        outputTone,
        showThinking,
        stepByStep,
        citeAuthorities,
        reasoningEffort,
        setReasoningEffort,
    } = useSessionConfig();

    // Session State
    const [messages, setMessages] = useState<MessageProps[]>([
        { role: "assistant", content: "Hello. I am Juristiq, your AI Legal Assistant. How can I help you today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [chatId, setChatId] = useState<number | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    // Intake State
    const [intakeCompleted, setIntakeCompleted] = useState(false);
    const [jurisdiction, setJurisdiction] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [deepAnalysis, setDeepAnalysis] = useState<boolean>(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleStartConsultation = (j: string, c: string, deep: boolean) => {
        setJurisdiction(j);
        setCategory(c);
        setDeepAnalysis(deep);
        setIntakeCompleted(true);
        // Add a system welcome message reflecting the choice
        const mode = deep ? "Deep Reasoning Mode" : "Standard Mode";
        const welcomeMsg: MessageProps = {
            role: "assistant",
            content: `Consultation session started for **${j}** regarding **${c}** (${mode}). Please state your request.`
        };
        setMessages([welcomeMsg]);
    };

    const handleSend = async (text: string) => {
        // Optimistic user message
        const userMsg: MessageProps = { role: "user", content: text };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);
        setError(null);

        try {
            // Pass strict context params
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
                if (res.chat_id && !chatId) {
                    setChatId(res.chat_id);
                }
            } else {
                throw new Error(res.error || "Unknown error");
            }
        } catch (err: any) {
            setError(err.message || "Failed to get response.");
            // We don't remove the user message, allowing retry or context.
        } finally {
            setIsLoading(false);
        }
    };

    if (!intakeCompleted) {
        return (
            <div className="w-full max-w-4xl mx-auto flex items-center justify-center p-4">
                <ConsultationIntake onStart={handleStartConsultation} />
            </div>
        );
    }

    return (
        <Card className="flex flex-col h-[600px] w-full max-w-4xl mx-auto shadow-xl border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="bg-primary px-4 py-3 text-primary-foreground flex items-center justify-between shadow-md z-10">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
                    <span className="font-semibold tracking-wide">
                        Juristiq Live Session <span className="text-primary-foreground/60 text-sm font-normal">| {jurisdiction} • {category}</span>
                    </span>
                    {deepAnalysis && (
                        <Badge variant="secondary" className="bg-accent/20 text-accent-foreground text-[10px] h-5 border-none animate-in zoom-in duration-300">
                            Smart Scaling Active
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {/* Document Actions */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-secondary/30 rounded-md p-0.5 border border-border/50">
                            <button
                                onClick={async () => {
                                    const lastAssistantMsg = messages.filter(m => m.role === "assistant").pop();
                                    if (lastAssistantMsg) {
                                        try {
                                            const res = await generateDocument("Legal Document", lastAssistantMsg.content, "docx");
                                            if (res.ok && res.downloadUrl) {
                                                window.location.href = res.downloadUrl; // Trigger download
                                            }
                                        } catch (e) { console.error(e); }
                                    }
                                }}
                                className="text-[10px] font-medium px-2 py-1 rounded hover:bg-background/80 transition-colors text-muted-foreground hover:text-foreground"
                                title="Download as Word"
                            >
                                DOCX
                            </button>
                            <div className="w-[1px] h-3 bg-border/50"></div>
                            <button
                                onClick={async () => {
                                    const lastAssistantMsg = messages.filter(m => m.role === "assistant").pop();
                                    if (lastAssistantMsg) {
                                        try {
                                            const res = await generateDocument("Legal Document", lastAssistantMsg.content, "pdf");
                                            if (res.ok && res.downloadUrl) {
                                                window.location.href = res.downloadUrl; // Trigger download
                                            }
                                        } catch (e) { console.error(e); }
                                    }
                                }}
                                className="text-[10px] font-medium px-2 py-1 rounded hover:bg-background/80 transition-colors text-muted-foreground hover:text-foreground"
                                title="Download as PDF"
                            >
                                PDF
                            </button>
                        </div>
                    </div>

                    {/* Reasoning Effort Selector */}
                    <div className="flex items-center gap-2">
                        <Label htmlFor="effort-select" className="text-[9px] font-medium uppercase tracking-tighter">Think:</Label>
                        <select
                            id="effort-select"
                            value={reasoningEffort}
                            onChange={(e) => setReasoningEffort(e.target.value as any)}
                            className="bg-black/10 text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded border border-white/10 cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
                        >
                            <option value="auto">Auto</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    {/* Deep Mode Toggle */}
                    <div className="flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full border border-white/5">
                        <BrainCircuit className={`h-3.5 w-3.5 ${deepAnalysis ? 'text-accent' : 'text-primary-foreground/40'}`} />
                        <Label htmlFor="deep-toggle" className="text-[10px] font-bold uppercase tracking-tighter cursor-pointer">Deep Mode</Label>
                        <Switch
                            id="deep-toggle"
                            checked={deepAnalysis}
                            onCheckedChange={setDeepAnalysis}
                            className="scale-75 data-[state=checked]:bg-accent"
                        />
                    </div>
                    {chatId && <span className="text-xs opacity-70">ID: {chatId}</span>}
                </div>
            </div>

            <div className="px-3 py-2 text-[11px] bg-amber-50 border-b border-amber-200 text-amber-900">
                Juristiq provides AI-assisted legal research support. Verify citations and professional obligations before relying on outputs.
            </div>

            {/* File Upload Area (Only visible after intake) */}
            <div className="bg-muted/30 border-b border-border/50 p-2">
                <FileUpload
                    currentTier="ultra" // Hardcoded for demo/user request (Ultra = 25MB)
                    isUploading={false}
                    onFileSelect={async (file) => {
                        try {
                            setIsLoading(true);
                            await uploadFile(file, "ultra");
                            // Add system message confirming upload
                            setMessages(prev => [...prev, {
                                role: "assistant",
                                content: `*File uploaded: ${file.name}*\nI have analyzed this document. What would you like to know?`,
                                model: "system"
                            }]);
                        } catch (e: any) {
                            setError(e.message);
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                />
            </div>


            <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
                <div className="p-4 space-y-4 pb-4">
                    {messages.map((msg, i) => (
                        <ChatMessage
                            key={i}
                            role={msg.role}
                            content={msg.content}
                            model={msg.model}
                            ai_metadata={msg.ai_metadata}
                        />
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-2 p-4 text-muted-foreground animate-pulse">
                            <div className="h-2 w-2 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="h-2 w-2 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="h-2 w-2 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                            <span className="text-sm ml-2">Consulting legal database ({jurisdiction})...</span>
                        </div>
                    )}
                    {error && (
                        <div className="mx-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>Error: {error}</span>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <ChatInput onSend={handleSend} disabled={isLoading} />
        </Card >
    );
}
