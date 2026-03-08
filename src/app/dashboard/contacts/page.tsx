"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Mail, RefreshCw, ShieldUser, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, AuthUser } from "@/lib/auth";

type LoadState = "loading" | "ready" | "empty" | "error";

export default function ContactsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setError(null);
    setLoadState("loading");

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoadState(currentUser ? "ready" : "empty");
    } catch (err) {
      setUser(null);
      setLoadState("error");
      setError(err instanceof Error ? err.message : "Unable to load contacts");
    }
  };

  useEffect(() => {
    let active = true;

    const initialLoad = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!active) return;
        setUser(currentUser);
        setLoadState(currentUser ? "ready" : "empty");
      } catch (err) {
        if (!active) return;
        setUser(null);
        setLoadState("error");
        setError(err instanceof Error ? err.message : "Unable to load contacts");
      }
    };

    void initialLoad();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="p-4 lg:p-6 space-y-4 overflow-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5" />
                Contacts
              </CardTitle>
              <CardDescription>Workspace contact directory (MVP).</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loadState === "loading"}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadState === "loading" ? <p className="text-sm text-slate-500">Loading contact profile...</p> : null}

          {loadState === "error" ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <span>{error || "Unable to load account contact details."}</span>
            </div>
          ) : null}

          {loadState === "ready" && user ? (
            <div className="rounded-md border p-4 bg-white space-y-2">
              <p className="text-sm font-semibold flex items-center gap-2">
                <ShieldUser className="h-4 w-4" />
                {user.name || "Account Owner"}
              </p>
              <p className="text-sm text-slate-600 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user.email || "No email on file"}
              </p>
              <p className="text-xs uppercase tracking-wide text-slate-500">Tenant: {user.tenant_id || "public"}</p>
            </div>
          ) : null}

          {loadState === "empty" ? <p className="text-sm text-slate-500">No contact profile available for this session.</p> : null}

          <p className="text-sm text-slate-500">
            Additional shared contacts can be added as the CRM module is expanded.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
