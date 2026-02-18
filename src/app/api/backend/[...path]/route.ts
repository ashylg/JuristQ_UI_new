import { backendAuthFetch } from "@/lib/server-auth";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

async function handler(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const search = new URL(request.url).search;
  const upstreamPath = `/${path.join("/")}${search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const plan = request.headers.get("x-plan");

  if (contentType) headers.set("Content-Type", contentType);
  if (plan) headers.set("x-plan", plan);

  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();

  const upstream = await backendAuthFetch(upstreamPath, {
    method: request.method,
    headers,
    body,
  });

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  const payload = await upstream.arrayBuffer();
  return new Response(payload, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
