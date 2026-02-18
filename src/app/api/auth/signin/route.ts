import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendAuthFetch, sessionCookieOptions, SESSION_COOKIE } from "@/lib/server-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const upstream = await backendAuthFetch("/v1/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return NextResponse.json({ error: data?.error || "Sign in failed", detail: data?.detail }, { status: upstream.status });
  }

  const token = data?.token;
  if (!token) {
    return NextResponse.json({ error: "Missing session token" }, { status: 500 });
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions());

  return NextResponse.json({ ok: true, user: data?.user });
}
