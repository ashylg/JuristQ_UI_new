"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, BriefcaseBusiness, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { emitWorkspaceEvent, WORKSPACE_MATTERS_CHANGED } from "@/lib/workspace-events";
import { createMatter, listMatters, Matter } from "@/lib/workspace-api";

type LoadState = "loading" | "ready" | "empty" | "error";

function formatDate(value?: string) {
  if (!value) return "recent";
  return new Date(value).toLocaleString();
}

export default function MattersPage() {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const refresh = async () => {
    setError(null);
    setLoadState((prev) => (prev === "ready" ? "ready" : "loading"));

    try {
      const data = await listMatters();
      setMatters(data);
      setLoadState(data.length ? "ready" : "empty");
    } catch (err) {
      setMatters([]);
      setLoadState("error");
      setError(err instanceof Error ? err.message : "Failed to load matters");
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    const handler = () => void refresh();
    window.addEventListener(WORKSPACE_MATTERS_CHANGED, handler);
    return () => window.removeEventListener(WORKSPACE_MATTERS_CHANGED, handler);
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setMessage(null);
    try {
      await createMatter({ title: title.trim(), description: description.trim() });
      setTitle("");
      setDescription("");
      setMessage("Matter created.");
      emitWorkspaceEvent(WORKSPACE_MATTERS_CHANGED);
      await refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create matter");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 overflow-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BriefcaseBusiness className="h-5 w-5" />
                Matters
              </CardTitle>
              <CardDescription>Create and track active matters for your workspace.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loadState === "loading"}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              placeholder="Matter title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={140}
            />
            <Textarea
              placeholder="Optional description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={1200}
            />
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving ? "Creating..." : "Create Matter"}
            </Button>
            {message ? <p className="text-sm text-slate-600">{message}</p> : null}
          </form>

          <div className="space-y-2">
            {loadState === "loading" ? (
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading matters...
              </p>
            ) : null}

            {loadState === "error" ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>{error || "Could not load matters."}</span>
              </div>
            ) : null}

            {loadState === "ready"
              ? matters.map((matter) => (
                  <div key={matter.id} className="rounded-md border p-3 bg-white">
                    <p className="font-medium text-sm">{matter.title}</p>
                    {matter.description ? <p className="mt-1 text-sm text-slate-600">{matter.description}</p> : null}
                    <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
                      {matter.status || "open"} • {formatDate(matter.created_at)}
                    </p>
                  </div>
                ))
              : null}

            {loadState === "empty" ? <p className="text-sm text-slate-500">No matters yet.</p> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
