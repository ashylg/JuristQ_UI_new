"use client";

import { useEffect, useState } from "react";
import { FileText, FolderUp, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listDocuments, listUploads, WorkspaceDocument, WorkspaceUpload } from "@/lib/workspace-api";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [uploads, setUploads] = useState<WorkspaceUpload[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [docs, files] = await Promise.all([listDocuments(), listUploads()]);
      setDocuments(docs);
      setUploads(files);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="p-4 lg:p-6 space-y-4 overflow-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Documents</h1>
        <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

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
                {doc.format || "doc"} • {doc.created_at ? new Date(doc.created_at).toLocaleString() : "recent"}
              </p>
            </div>
          ))}
          {!loading && documents.length === 0 ? <p className="text-sm text-slate-500">No generated documents yet.</p> : null}
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
                {upload.content_type || "file"} • {upload.created_at ? new Date(upload.created_at).toLocaleString() : "recent"}
              </p>
            </div>
          ))}
          {!loading && uploads.length === 0 ? <p className="text-sm text-slate-500">No uploads yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
