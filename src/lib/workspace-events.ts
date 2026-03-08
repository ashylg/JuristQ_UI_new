export const WORKSPACE_THREADS_CHANGED = "juristiq:threads-changed";
export const WORKSPACE_MATTERS_CHANGED = "juristiq:matters-changed";
export const WORKSPACE_DOCUMENTS_CHANGED = "juristiq:documents-changed";
export const WORKSPACE_AUTH_CHANGED = "juristiq:auth-changed";

export function emitWorkspaceEvent(eventName: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(eventName));
}
