import { emitWorkspaceEvent, WORKSPACE_AUTH_CHANGED } from "@/lib/workspace-events";

export type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  tenant_id?: string;
};

export type AuthResult = {
  ok: boolean;
  user?: AuthUser;
  error?: string;
};

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T;
}

function describeAuthFailure(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function signUp(input: {
  email: string;
  password: string;
  name?: string;
  tenantId?: string;
}): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        name: input.name,
        tenant_id: input.tenantId,
      }),
    });

    const data = await parseJson<{ user?: AuthUser; error?: string }>(response);
    if (!response.ok) return { ok: false, error: data.error || "Sign up failed" };

    emitWorkspaceEvent(WORKSPACE_AUTH_CHANGED);
    return { ok: true, user: data.user };
  } catch (error) {
    return { ok: false, error: describeAuthFailure(error, "Could not reach auth service") };
  }
}

export async function signIn(input: {
  email: string;
  password: string;
  tenantId?: string;
}): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        tenant_id: input.tenantId,
      }),
    });

    const data = await parseJson<{ user?: AuthUser; error?: string }>(response);
    if (!response.ok) return { ok: false, error: data.error || "Sign in failed" };

    emitWorkspaceEvent(WORKSPACE_AUTH_CHANGED);
    return { ok: true, user: data.user };
  } catch (error) {
    return { ok: false, error: describeAuthFailure(error, "Could not reach auth service") };
  }
}

export async function signOut(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/signout", {
      method: "POST",
      credentials: "same-origin",
    });
    emitWorkspaceEvent(WORKSPACE_AUTH_CHANGED);
    return response.ok;
  } catch {
    emitWorkspaceEvent(WORKSPACE_AUTH_CHANGED);
    return false;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!response.ok) return null;
    const data = await parseJson<{ user?: AuthUser }>(response);
    return data.user || null;
  } catch {
    return null;
  }
}
