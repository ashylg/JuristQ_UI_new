import { cookies } from "next/headers";

export const SESSION_COOKIE = "juristiq_session";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://juristiq-api.ashylspgosai.workers.dev";

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
