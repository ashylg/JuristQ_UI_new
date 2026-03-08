const API_BASE = "/api/backend";

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

type ApiErrorPayload = { error?: string; detail?: string };

async function readJson<T>(res: Response): Promise<T> {
  return (await res.json().catch(() => ({}))) as T;
}

async function ensureOk(res: Response, fallback: string): Promise<void> {
  if (res.ok) return;
  const payload = await readJson<ApiErrorPayload>(res);
  throw new Error(payload.error || payload.detail || fallback);
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
  const res = await fetch(`${API_BASE}/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

  await ensureOk(res, `API Error ${res.status}`);
  return readJson<ChatResponse>(res);
}

export type UploadResponse = {
  ok: boolean;
  id: number;
  filename: string;
  key: string;
  bytes: number;
  error?: string;
};

export async function uploadFile(file: File, plan: "basic" | "pro" | "ultra" | "mega"): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/v1/upload`, {
    method: "POST",
    headers: {
      "x-plan": plan,
    },
    body: formData,
  });

  await ensureOk(res, "Upload failed");
  return readJson<UploadResponse>(res);
}

export type GenerateDocumentResponse = {
  ok: boolean;
  id: number;
  filename: string;
  key: string;
  downloadUrl: string;
  error?: string;
};

export async function generateDocument(
  title: string,
  content: string,
  format: "docx" | "pdf" = "docx"
): Promise<GenerateDocumentResponse> {
  const res = await fetch(`${API_BASE}/v1/document/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, format }),
  });

  await ensureOk(res, "Document generation failed");
  return readJson<GenerateDocumentResponse>(res);
}
