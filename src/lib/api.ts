import { buildAuthHeaders } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://juristiq-api.ashylspgosai.workers.dev";

export interface ChatResponse {
    answer: string;
    chat_id?: number;
    used?: unknown[];
    conversation_length?: number;
    model?: string;
    ai_metadata?: {
        strategy: "model" | "effort";
        reasoning_effort: string;
        complexity_detected: boolean;
        estimated_cost: number;
        tokens_used: number;
    };
    error?: string;
}

export async function sendMessage(
    message: string,
    chatId?: number,
    jurisdiction?: string,
    category?: string,
    deepAnalysis?: boolean,
    reasoningEffort?: string,
    options?: {
        modelTier?: "standard" | "advanced" | "expert";
        outputTone?: "plain" | "academic";
        showThinking?: boolean;
        stepByStep?: boolean;
        citeAuthorities?: boolean;
    }
): Promise<ChatResponse> {
    try {
        const authHeaders = await buildAuthHeaders();
        const res = await fetch(`${API_URL}/v1/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders,
            },
            body: JSON.stringify({
                message,
                chat_id: chatId,
                jurisdictions: jurisdiction ? [jurisdiction] : ["NZ"],
                category,
                deep_analysis: deepAnalysis,
                reasoning_effort: reasoningEffort,
                model_tier: options?.modelTier,
                output_tone: options?.outputTone,
                show_thinking: options?.showThinking,
                step_by_step: options?.stepByStep,
                cite_authorities: options?.citeAuthorities,
            }),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`API Error ${res.status}: ${text}`);
        }

        return await res.json();
    } catch (error) {
        console.error("Chat API Error:", error);
        throw error;
    }
}

export async function uploadFile(file: File, plan: "basic" | "pro" | "ultra" | "mega"): Promise<{ ok: boolean, filename: string, key: string, error?: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const authHeaders = await buildAuthHeaders();
    const res = await fetch(`${API_URL}/v1/upload`, {
        method: "POST",
        headers: {
            "x-plan": plan, // Enforce plan limits
            ...authHeaders,
        },
        body: formData,
    });

    // 413 = Payload Too Large, 429 = Too Many Requests
    if (res.status === 413 || res.status === 429) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error || "File upload limits exceeded");
    }

    if (!res.ok) {
        throw new Error("Upload failed");
    }

    return await res.json();
}

export async function generateDocument(title: string, content: string, format: "docx" | "pdf" = "docx"): Promise<{ ok: boolean, filename: string, key: string, downloadUrl: string, error?: string }> {
    const authHeaders = await buildAuthHeaders();
    const res = await fetch(`${API_URL}/v1/document/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ title, content, format })
    });

    if (!res.ok) throw new Error("Document generation failed");
    return await res.json();
}
