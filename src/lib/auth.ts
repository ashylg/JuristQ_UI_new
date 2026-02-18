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

export async function signUp(input: {
  email: string;
  password: string;
  name?: string;
  tenantId?: string;
}): Promise<AuthResult> {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      name: input.name,
      tenant_id: input.tenantId,
    }),
  });

  const data = await parseJson<{ user?: AuthUser; error?: string }>(response);
  if (!response.ok) return { ok: false, error: data.error || "Sign up failed" };
  return { ok: true, user: data.user };
}

export async function signIn(input: {
  email: string;
  password: string;
  tenantId?: string;
}): Promise<AuthResult> {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      tenant_id: input.tenantId,
    }),
  });

  const data = await parseJson<{ user?: AuthUser; error?: string }>(response);
  if (!response.ok) return { ok: false, error: data.error || "Sign in failed" };
  return { ok: true, user: data.user };
}

export async function signOut(): Promise<boolean> {
  const response = await fetch("/api/auth/signout", { method: "POST" });
  return response.ok;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/me", { method: "GET", cache: "no-store" });
  if (!response.ok) return null;
  const data = await parseJson<{ user?: AuthUser }>(response);
  return data.user || null;
}
