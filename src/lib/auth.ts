export type AuthContext = {
  token?: string;
  userId?: string;
};

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken?: (opts?: { template?: string }) => Promise<string | null>;
      };
      user?: {
        id?: string;
      };
    };
  }
}

const TOKEN_KEY = "juristiq_auth_token";
const USER_ID_KEY = "juristiq_user_id";
const TENANT_ID_KEY = "juristiq_tenant_id";

export function setDevAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) window.localStorage.removeItem(TOKEN_KEY);
  else window.localStorage.setItem(TOKEN_KEY, token);
}

export function setDevUserId(userId: string | null) {
  if (typeof window === "undefined") return;
  if (!userId) window.localStorage.removeItem(USER_ID_KEY);
  else window.localStorage.setItem(USER_ID_KEY, userId);
}

export function setDevTenantId(tenantId: string | null) {
  if (typeof window === "undefined") return;
  if (!tenantId) window.localStorage.removeItem(TENANT_ID_KEY);
  else window.localStorage.setItem(TENANT_ID_KEY, tenantId);
}

async function resolveToken(): Promise<string | undefined> {
  if (typeof window === "undefined") return undefined;

  const clerkToken = await window.Clerk?.session?.getToken?.({ template: "juristiq" }).catch(() => null);
  if (clerkToken) return clerkToken;

  return window.localStorage.getItem(TOKEN_KEY) || undefined;
}

function resolveUserId(): string | undefined {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_DEV_USER_ID || undefined;

  const clerkUser = window.Clerk?.user?.id;
  if (clerkUser) return clerkUser;

  return (
    window.localStorage.getItem(USER_ID_KEY) ||
    process.env.NEXT_PUBLIC_DEV_USER_ID ||
    undefined
  );
}

function resolveTenantId(): string {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_DEV_TENANT_ID || "public";
  return window.localStorage.getItem(TENANT_ID_KEY) || process.env.NEXT_PUBLIC_DEV_TENANT_ID || "public";
}

export function isAuthRequired(): boolean {
  return process.env.NEXT_PUBLIC_REQUIRE_AUTH === "true";
}

export async function hasClientAuthIdentity(): Promise<boolean> {
  const token = await resolveToken();
  const userId = resolveUserId();
  return Boolean(token || userId);
}

export async function buildAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {};
  const token = await resolveToken();
  const userId = resolveUserId();
  const tenantId = resolveTenantId();

  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (userId) headers["x-clerk-user-id"] = userId;
  if (tenantId) headers["x-tenant-id"] = tenantId;

  return headers;
}
