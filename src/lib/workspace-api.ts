const API_BASE = "/api/backend";

export class ApiError extends Error {
  status: number;
  detail?: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const payload = await parseJson<{ error?: string; detail?: string } & T>(response);
  if (!response.ok) {
    throw new ApiError(
      payload.error || payload.detail || `Request failed (${response.status})`,
      response.status,
      payload.detail
    );
  }

  return payload;
}

export type ThreadSummary = {
  id: number;
  title?: string | null;
  jurisdictions?: string | null;
  document_types?: string | null;
  created_at?: string;
  updated_at?: string;
  last_message?: string | null;
  message_count?: number;
};

export type ThreadHistoryMessage = {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

export async function listThreads(): Promise<ThreadSummary[]> {
  const data = await requestJson<{ sessions?: ThreadSummary[] }>("/v1/chat/sessions", { method: "GET" });
  return data.sessions || [];
}

export async function createThread(input?: {
  title?: string;
  jurisdictions?: string[];
  documentTypes?: string[];
}): Promise<ThreadSummary> {
  const data = await requestJson<{ session: ThreadSummary }>("/v1/chat/sessions", {
    method: "POST",
    body: JSON.stringify({
      title: input?.title,
      jurisdictions: input?.jurisdictions || ["NZ"],
      document_types: input?.documentTypes || ["general"],
    }),
  });
  return data.session;
}

export async function renameThread(threadId: number, title: string): Promise<ThreadSummary> {
  const data = await requestJson<{ session: ThreadSummary }>(`/v1/chat/sessions/${threadId}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
  return data.session;
}

export async function deleteThread(threadId: number): Promise<void> {
  await requestJson<{ ok: boolean }>(`/v1/chat/sessions/${threadId}`, { method: "DELETE" });
}

export async function getThreadHistory(threadId: number): Promise<ThreadHistoryMessage[]> {
  const data = await requestJson<{ history?: ThreadHistoryMessage[] }>(`/v1/chat/history?chat_id=${threadId}`, {
    method: "GET",
  });
  return data.history || [];
}

export type Matter = {
  id: number;
  title: string;
  description?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export async function listMatters(): Promise<Matter[]> {
  const data = await requestJson<{ matters?: Matter[] }>("/v1/matters", { method: "GET" });
  return data.matters || [];
}

export async function createMatter(input: { title: string; description?: string }): Promise<Matter> {
  const data = await requestJson<{ matter: Matter }>("/v1/matters", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.matter;
}

export type WorkspaceDocument = {
  id: number;
  title: string;
  format?: string;
  size_bytes?: number;
  created_at?: string;
  storage_key?: string;
};

export type WorkspaceUpload = {
  id: number;
  filename: string;
  content_type?: string;
  size_bytes?: number;
  created_at?: string;
};

export async function listDocuments(): Promise<WorkspaceDocument[]> {
  const data = await requestJson<{ documents?: WorkspaceDocument[] }>("/v1/documents", { method: "GET" });
  return data.documents || [];
}

export async function listUploads(): Promise<WorkspaceUpload[]> {
  const data = await requestJson<{ uploads?: WorkspaceUpload[] }>("/v1/uploads", { method: "GET" });
  return data.uploads || [];
}
