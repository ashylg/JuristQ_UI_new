"use client";

import { useEffect, useState } from "react";
import { AlertCircle, FileText, FolderUp, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WORKSPACE_DOCUMENTS_CHANGED } from "@/lib/workspace-events";
import { listDocuments, listUploads, WorkspaceDocument, WorkspaceUpload } from "@/lib/workspace-api";

type LoadState = "loading" | "ready" | "empty" | "error";

function formatDate(value?: string) {
  if (!value) return "recent";
  return new Date(value).toLocaleString();
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [uploads, setUploads] = useState<WorkspaceUpload[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setError(null);
    setLoadState((prev) => (prev === "ready" ? "ready" : "loading"));

    try {
      const [docs, files] = await Promise.all([listDocuments(), listUploads()]);
      setDocuments(docs);
      setUploads(files);
      setLoadState(docs.length || files.length ? "ready" : "empty");
    } catch (err) {
      setDocuments([]);
      setUploads([]);
      setLoadState("error");
      setError(err instanceof Error ? err.message : "Failed to load documents");
    }
  };

  useEffect(() => {
    let active = true;

    const initialLoad = async () => {
      try {
        const [docs, files] = await Promise.all([listDocuments(), listUploads()]);
        if (!active) return;
        setDocuments(docs);
        setUploads(files);
        setLoadState(docs.length || files.length ? "ready" : "empty");
      } catch (err) {
        if (!active) return;
        setDocuments([]);
        setUploads([]);
        setLoadState("error");
        setError(err instanceof Error ? err.message : "Failed to load documents");
      }
    };

    void initialLoad();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handler = () => void refresh();
    window.addEventListener(WORKSPACE_DOCUMENTS_CHANGED, handler);
    return () => window.removeEventListener(WORKSPACE_DOCUMENTS_CHANGED, handler);
  }, []);

  return (
    <div className="p-4 lg:p-6 space-y-4 overflow-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Documents</h1>
        <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loadState === "loading"}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loadState === "loading" ? (
        <p className="text-sm text-slate-500 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading document library...
        </p>
      ) : null}

      {loadState === "error" ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <span>{error || "Could not load documents."}</span>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generated documents
          </CardTitle>
          <CardDescription>Documents created from assistant responses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="rounded-md border p-3 bg-white">
              <p className="font-medium text-sm">{doc.title}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">
                {doc.format || "doc"} • {formatDate(doc.created_at)}
              </p>
            </div>
          ))}
          {loadState !== "loading" && documents.length === 0 ? (
            <p className="text-sm text-slate-500">No generated documents yet.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderUp className="h-5 w-5" />
            Uploaded files
          </CardTitle>
          <CardDescription>Recently uploaded reference files.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {uploads.map((upload) => (
            <div key={upload.id} className="rounded-md border p-3 bg-white">
              <p className="font-medium text-sm">{upload.filename}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">
                {upload.content_type || "file"} • {formatDate(upload.created_at)}
              </p>
            </div>
          ))}
          {loadState !== "loading" && uploads.length === 0 ? (
            <p className="text-sm text-slate-500">No uploads yet.</p>
          ) : null}
        </CardContent>
      </Card>

      {loadState === "empty" ? (
        <p className="text-sm text-slate-500">No documents or uploads yet. Generate or upload files to see them here.</p>
      ) : null}
    </div>
  );
}
