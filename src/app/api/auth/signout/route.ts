import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendAuthFetch, SESSION_COOKIE } from "@/lib/server-auth";

export async function POST() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) {
    await backendAuthFetch("/v1/auth/signout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }, token).catch(() => null);
  }

  store.delete(SESSION_COOKIE);

  return NextResponse.json({ ok: true });
}
