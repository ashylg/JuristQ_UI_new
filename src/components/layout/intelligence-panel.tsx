"use client";

import { FormEvent, useEffect, useState } from "react";
import { BriefcaseBusiness, FileText, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { createMatter, listDocuments, WorkspaceDocument } from "@/lib/workspace-api";

export function IntelligencePanel() {
  const [matterTitle, setMatterTitle] = useState("");
  const [matterDescription, setMatterDescription] = useState("");
  const [matterSaving, setMatterSaving] = useState(false);
  const [matterMessage, setMatterMessage] = useState<string | null>(null);

  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  const refreshDocuments = async () => {
    setDocumentsLoading(true);
    try {
      const docs = await listDocuments();
      setDocuments(docs.slice(0, 8));
    } catch {
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  useEffect(() => {
    void refreshDocuments();
  }, []);

  const onCreateMatter = async (event: FormEvent) => {
    event.preventDefault();
    const title = matterTitle.trim();
    if (!title) return;

    setMatterSaving(true);
    setMatterMessage(null);
    try {
      await createMatter({ title, description: matterDescription.trim() });
      setMatterTitle("");
      setMatterDescription("");
      setMatterMessage("Matter created.");
      window.dispatchEvent(new Event("juristiq:matters-changed"));
    } catch (error) {
      setMatterMessage(error instanceof Error ? error.message : "Failed to create matter");
    } finally {
      setMatterSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-6">
      <div className="space-y-1">
        <h3 className="font-semibold text-sm text-slate-900">Management Controls</h3>
        <p className="text-xs text-slate-500">Real workspace controls connected to your account data.</p>
      </div>

      <form onSubmit={onCreateMatter} className="space-y-3">
        <Label className="text-xs font-medium text-slate-500 uppercase">Create Matter</Label>
        <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-white">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <BriefcaseBusiness className="h-4 w-4" />
            New matter
          </div>
          <Input
            value={matterTitle}
            onChange={(event) => setMatterTitle(event.target.value)}
            placeholder="e.g. Tenant bond dispute"
            maxLength={140}
          />
          <Textarea
            value={matterDescription}
            onChange={(event) => setMatterDescription(event.target.value)}
            placeholder="Optional description"
            rows={3}
            maxLength={1200}
          />
          <Button type="submit" size="sm" className="w-full" disabled={matterSaving || !matterTitle.trim()}>
            {matterSaving ? "Creating..." : "Create Matter"}
          </Button>
          {matterMessage ? <p className="text-xs text-slate-600">{matterMessage}</p> : null}
        </div>
      </form>

      <Separator />

      <div className="space-y-3 min-h-0 flex-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-slate-500 uppercase">Generated Documents</Label>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => void refreshDocuments()}>
            {documentsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-2 overflow-auto pr-1">
          {documents.map((doc) => (
            <div key={doc.id} className="rounded-md border border-slate-200 bg-white p-2">
              <div className="flex items-center gap-2 text-sm text-slate-800">
                <FileText className="h-4 w-4 text-slate-500" />
                <span className="truncate">{doc.title}</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 uppercase tracking-wide">
                {doc.format || "doc"} • {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "recent"}
              </p>
            </div>
          ))}

          {!documentsLoading && documents.length === 0 ? (
            <p className="text-xs text-slate-500">No generated documents yet.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
