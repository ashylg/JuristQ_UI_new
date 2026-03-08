import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "juristiq_session";
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

const API_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL || process.env.JURISTIQ_API_URL);

async function hasValidSession(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/v1/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard");
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";

  if (!token) {
    if (isDashboard) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  const validSession = await hasValidSession(token);

  if (!validSession) {
    if (isDashboard) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("next", pathname);
      const response = NextResponse.redirect(signInUrl);
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }

    const response = NextResponse.next();
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
