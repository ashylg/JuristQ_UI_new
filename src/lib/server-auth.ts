import { cookies } from "next/headers";

export const SESSION_COOKIE = "juristiq_session";

const CLOUD_API_URL = "https://juristiq-api.ashylspgosai.workers.dev";

function normalizeApiUrl(raw?: string): string {
  if (!raw) return CLOUD_API_URL;

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
      return CLOUD_API_URL;
    }
    return parsed.origin;
  } catch {
    return CLOUD_API_URL;
  }
}

export const API_URL = normalizeApiUrl(process.env.JURISTIQ_API_URL || process.env.NEXT_PUBLIC_API_URL);

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function getSessionTokenFromCookies(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value || null;
}

export async function backendAuthFetch(path: string, init: RequestInit = {}, token?: string | null): Promise<Response> {
  const sessionToken = token ?? (await getSessionTokenFromCookies());
  const headers = new Headers(init.headers || {});

  if (sessionToken) {
    headers.set("Authorization", `Bearer ${sessionToken}`);
  }

  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });
}
