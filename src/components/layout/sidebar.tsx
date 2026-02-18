"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BriefcaseBusiness,
  CheckSquare,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Pencil,
  Plus,
  Settings,
  Trash2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";
import {
  createThread,
  deleteThread,
  listThreads,
  renameThread,
  ThreadSummary,
} from "@/lib/workspace-api";

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/matters", label: "Matters", icon: BriefcaseBusiness },
  { href: "/dashboard/contacts", label: "Contacts", icon: Users },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

function shortThreadTitle(thread: ThreadSummary): string {
  const text = (thread.title || thread.last_message || "Untitled thread").trim();
  if (text.length <= 42) return text;
  return `${text.slice(0, 39)}...`;
}

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [busyThreadId, setBusyThreadId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const activeThreadId = useMemo(() => {
    const raw = searchParams.get("thread");
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }, [searchParams]);

  const refreshThreads = useCallback(async () => {
    setLoading(true);
    try {
      const sessions = await listThreads();
      setThreads(sessions);
    } catch {
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshThreads();
  }, [refreshThreads]);

  useEffect(() => {
    const handler = () => void refreshThreads();
    window.addEventListener("juristiq:threads-changed", handler);
    return () => window.removeEventListener("juristiq:threads-changed", handler);
  }, [refreshThreads]);

  const dispatchThreadsChanged = () => {
    window.dispatchEvent(new Event("juristiq:threads-changed"));
  };

  const handleCreateThread = async () => {
    setBusyThreadId(-1);
    try {
      const session = await createThread();
      router.push(`/dashboard?thread=${session.id}`);
      dispatchThreadsChanged();
    } finally {
      setBusyThreadId(null);
    }
  };

  const handleRenameThread = async (thread: ThreadSummary) => {
    const currentTitle = shortThreadTitle(thread);
    const nextTitle = window.prompt("Rename thread", currentTitle);
    if (!nextTitle || !nextTitle.trim()) return;

    setBusyThreadId(thread.id);
    try {
      await renameThread(thread.id, nextTitle.trim());
      dispatchThreadsChanged();
    } finally {
      setBusyThreadId(null);
    }
  };

  const handleDeleteThread = async (thread: ThreadSummary) => {
    if (!window.confirm(`Delete thread \"${shortThreadTitle(thread)}\"?`)) return;

    setBusyThreadId(thread.id);
    try {
      await deleteThread(thread.id);

      if (activeThreadId === thread.id) {
        router.push("/dashboard");
      }

      dispatchThreadsChanged();
    } finally {
      setBusyThreadId(null);
    }
  };

  return (
    <div className={cn("pb-4 h-full flex flex-col", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3">
          <Button
            variant="default"
            className="w-full justify-start gap-2 shadow-sm"
            onClick={handleCreateThread}
            disabled={busyThreadId === -1}
          >
            <Plus className="h-4 w-4" />
            {busyThreadId === -1 ? "Creating thread..." : "New Thread"}
          </Button>
        </div>

        <div className="px-3">
          <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-slate-500 uppercase">
            Workspace
          </h2>
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2 font-normal"
                >
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="px-3">
          <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-slate-500 uppercase">
            Threads
          </h2>

          <ScrollArea className="h-[280px] px-1">
            <div className="space-y-1">
              {threads.map((thread) => {
                const selected = pathname === "/dashboard" && activeThreadId === thread.id;
                const disabled = busyThreadId === thread.id;

                return (
                  <div
                    key={thread.id}
                    className={cn(
                      "group rounded-md border border-transparent hover:border-slate-200",
                      selected && "border-slate-300 bg-slate-100"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => router.push(`/dashboard?thread=${thread.id}`)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm flex items-start gap-2",
                        selected ? "text-slate-900" : "text-slate-700"
                      )}
                    >
                      <MessageSquare className="h-4 w-4 mt-0.5 text-slate-500" />
                      <span className="min-w-0 flex-1 truncate">{shortThreadTitle(thread)}</span>
                    </button>

                    <div className="px-3 pb-2 hidden group-hover:flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={disabled}
                        onClick={() => void handleRenameThread(thread)}
                        title="Rename thread"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-600 hover:text-red-600"
                        disabled={disabled}
                        onClick={() => void handleDeleteThread(thread)}
                        title="Delete thread"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {!loading && threads.length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-500">No conversations yet. Start a new thread.</p>
              ) : null}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="mt-auto px-3 py-4 border-t border-slate-100">
        <div className="space-y-1">
          <Button variant="ghost" asChild className="w-full justify-start gap-2 font-normal text-slate-600">
            <Link href="/dashboard/settings">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Button>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
