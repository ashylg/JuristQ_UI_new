const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://juristiq-api.ashylspgosai.workers.dev";

export interface ChatResponse {
    answer: string;
    chat_id?: number;
    used?: any[];
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
    reasoningEffort?: string
): Promise<ChatResponse> {
    try {
        const res = await fetch(`${API_URL}/v1/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // "Authorization": "Bearer sk-proj-placeholder", // If needed by backend
            },
            body: JSON.stringify({
                message,
                chat_id: chatId,
                // model: "gpt-4o-mini", // Let backend handle smart selection
                jurisdictions: jurisdiction ? [jurisdiction] : ["US"], // Default jurisdiction if not provided
                deep_analysis: deepAnalysis, // Pass the flag
                reasoning_effort: reasoningEffort, // Pass reasoning effort override
                // Map category to document types or just filter if backend supports it.
                // For now, we assume backend search uses these to filter.
                // We can also pass 'category' if the backend accepted it, but it accepts 'document_types'
                // Let's interpret category broadly for doc types for now or add to context message.
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

    const res = await fetch(`${API_URL}/v1/upload`, {
        method: "POST",
        headers: {
            "x-plan": plan, // Enforce plan limits
        },
        body: formData,
    });

    // 413 = Payload Too Large, 429 = Too Many Requests
    if (res.status === 413 || res.status === 429) {
        const err = await res.json() as any;
        throw new Error(err.error || "File upload limits exceeded");
    }

    if (!res.ok) {
        throw new Error("Upload failed");
    }

    return await res.json();
}

export async function generateDocument(title: string, content: string, format: "docx" | "pdf" = "docx"): Promise<{ ok: boolean, filename: string, key: string, downloadUrl: string, error?: string }> {
    const res = await fetch(`${API_URL}/v1/document/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, format })
    });

    if (!res.ok) throw new Error("Document generation failed");
    return await res.json();
}
