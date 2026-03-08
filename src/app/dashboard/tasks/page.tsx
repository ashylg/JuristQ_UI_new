"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckSquare, CircleCheck, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  WORKSPACE_DOCUMENTS_CHANGED,
  WORKSPACE_MATTERS_CHANGED,
  WORKSPACE_THREADS_CHANGED,
} from "@/lib/workspace-events";
import {
  listDocuments,
  listMatters,
  listThreads,
  listUploads,
  Matter,
  ThreadSummary,
  WorkspaceDocument,
  WorkspaceUpload,
} from "@/lib/workspace-api";

type GeneratedTask = {
  id: string;
  title: string;
  detail: string;
  kind: "matter" | "thread" | "document" | "upload";
};

type LoadState = "loading" | "ready" | "empty" | "error";

export default function TasksPage() {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [uploads, setUploads] = useState<WorkspaceUpload[]>([]);

  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setError(null);
    setLoadState((prev) => (prev === "ready" ? "ready" : "loading"));

    try {
      const [matterRows, threadRows, documentRows, uploadRows] = await Promise.all([
        listMatters(),
        listThreads(),
        listDocuments(),
        listUploads(),
      ]);

      setMatters(matterRows);
      setThreads(threadRows);
      setDocuments(documentRows);
      setUploads(uploadRows);

      const hasData = matterRows.length || threadRows.length || documentRows.length || uploadRows.length;
      setLoadState(hasData ? "ready" : "empty");
    } catch (err) {
      setMatters([]);
      setThreads([]);
      setDocuments([]);
      setUploads([]);
      setLoadState("error");
      setError(err instanceof Error ? err.message : "Failed to load work queues");
    }
  };

  useEffect(() => {
    let active = true;

    const initialLoad = async () => {
      try {
        const [matterRows, threadRows, documentRows, uploadRows] = await Promise.all([
          listMatters(),
          listThreads(),
          listDocuments(),
          listUploads(),
        ]);
        if (!active) return;

        setMatters(matterRows);
        setThreads(threadRows);
        setDocuments(documentRows);
        setUploads(uploadRows);

        const hasData = matterRows.length || threadRows.length || documentRows.length || uploadRows.length;
        setLoadState(hasData ? "ready" : "empty");
      } catch (err) {
        if (!active) return;
        setMatters([]);
        setThreads([]);
        setDocuments([]);
        setUploads([]);
        setLoadState("error");
        setError(err instanceof Error ? err.message : "Failed to load work queues");
      }
    };

    void initialLoad();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handler = () => void refresh();
    window.addEventListener(WORKSPACE_THREADS_CHANGED, handler);
    window.addEventListener(WORKSPACE_MATTERS_CHANGED, handler);
    window.addEventListener(WORKSPACE_DOCUMENTS_CHANGED, handler);
    return () => {
      window.removeEventListener(WORKSPACE_THREADS_CHANGED, handler);
      window.removeEventListener(WORKSPACE_MATTERS_CHANGED, handler);
      window.removeEventListener(WORKSPACE_DOCUMENTS_CHANGED, handler);
    };
  }, []);

  const tasks = useMemo<GeneratedTask[]>(() => {
    const generated: GeneratedTask[] = [];

    matters.slice(0, 5).forEach((matter) => {
      generated.push({
        id: `matter-${matter.id}`,
        title: `Review matter: ${matter.title}`,
        detail: "Confirm filing strategy and next client update.",
        kind: "matter",
      });
    });

    threads.slice(0, 4).forEach((thread) => {
      generated.push({
        id: `thread-${thread.id}`,
        title: `Follow up conversation #${thread.id}`,
        detail: "Capture key answer in a formal memo or generated document.",
        kind: "thread",
      });
    });

    documents.slice(0, 3).forEach((doc) => {
      generated.push({
        id: `document-${doc.id}`,
        title: `Finalize generated document: ${doc.title}`,
        detail: "Validate formatting and send to the relevant stakeholder.",
        kind: "document",
      });
    });

    uploads.slice(0, 3).forEach((upload) => {
      generated.push({
        id: `upload-${upload.id}`,
        title: `Classify uploaded file: ${upload.filename}`,
        detail: "Link this file to the correct matter and tag for retrieval.",
        kind: "upload",
      });
    });

    return generated;
  }, [matters, threads, documents, uploads]);

  return (
    <div className="p-4 lg:p-6 space-y-4 overflow-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Tasks
              </CardTitle>
              <CardDescription>Action checklist generated from live workspace activity.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loadState === "loading"}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadState === "loading" ? (
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading task candidates...
            </p>
          ) : null}

          {loadState === "error" ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <span>{error || "Could not load task inputs."}</span>
            </div>
          ) : null}

          {tasks.map((task) => {
            const done = doneIds.includes(task.id);
            return (
              <button
                key={task.id}
                type="button"
                onClick={() =>
                  setDoneIds((prev) => (prev.includes(task.id) ? prev.filter((id) => id !== task.id) : [...prev, task.id]))
                }
                className={`w-full text-left rounded-md border p-3 transition-colors ${
                  done ? "bg-emerald-50 border-emerald-200" : "bg-white"
                }`}
              >
                <p className="font-medium text-sm flex items-center gap-2">
                  <CircleCheck className={`h-4 w-4 ${done ? "text-emerald-600" : "text-slate-400"}`} />
                  {task.title}
                </p>
                <p className="mt-1 text-sm text-slate-600">{task.detail}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">Source: {task.kind}</p>
              </button>
            );
          })}

          {loadState === "empty" ? (
            <p className="text-sm text-slate-500">No matters, threads, documents, or uploads yet. Add activity to generate tasks.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
