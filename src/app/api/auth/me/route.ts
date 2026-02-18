import { NextResponse } from "next/server";
import { backendAuthFetch } from "@/lib/server-auth";

export async function GET() {
  const upstream = await backendAuthFetch("/v1/auth/me", { method: "GET" });
  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json({ error: data?.error || "Unauthorized" }, { status: upstream.status });
  }

  return NextResponse.json({ ok: true, user: data?.user });
}
