"use client";

import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, Settings, ShieldCheck } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, AuthUser } from "@/lib/auth";
import { WORKSPACE_AUTH_CHANGED } from "@/lib/workspace-events";

type LoadState = "loading" | "ready" | "empty" | "error";

export default function SettingsPage() {
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
      setError(err instanceof Error ? err.message : "Unable to load account settings");
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
        setError(err instanceof Error ? err.message : "Unable to load account settings");
      }
    };

    void initialLoad();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handler = () => void refresh();
    window.addEventListener(WORKSPACE_AUTH_CHANGED, handler);
    return () => window.removeEventListener(WORKSPACE_AUTH_CHANGED, handler);
  }, []);

  return (
    <div className="p-4 lg:p-6 space-y-4 overflow-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
              <CardDescription>Session and account controls.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loadState === "loading"}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadState === "loading" ? <p className="text-sm text-slate-500">Loading account settings...</p> : null}

          {loadState === "error" ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <span>{error || "Unable to load settings details."}</span>
            </div>
          ) : null}

          <div className="rounded-md border p-4 bg-white">
            <p className="font-medium text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Signed in
            </p>
            <p className="text-sm text-slate-600 mt-1">{user?.email || "Unknown account"}</p>
            <p className="text-xs uppercase tracking-wide text-slate-500 mt-2">Tenant: {user?.tenant_id || "public"}</p>
            {loadState === "empty" ? (
              <p className="text-xs text-slate-500 mt-2">No active profile metadata available.</p>
            ) : null}
          </div>

          <div className="max-w-xs">
            <SignOutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
