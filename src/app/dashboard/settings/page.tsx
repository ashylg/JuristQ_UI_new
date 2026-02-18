"use client";

import { useEffect, useState } from "react";
import { Settings, ShieldCheck } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, AuthUser } from "@/lib/auth";

export default function SettingsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    void getCurrentUser().then(setUser).catch(() => setUser(null));
  }, []);

  return (
    <div className="p-4 lg:p-6 space-y-4 overflow-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </CardTitle>
          <CardDescription>Session and account controls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border p-4 bg-white">
            <p className="font-medium text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Signed in
            </p>
            <p className="text-sm text-slate-600 mt-1">{user?.email || "Unknown account"}</p>
            <p className="text-xs uppercase tracking-wide text-slate-500 mt-2">Tenant: {user?.tenant_id || "public"}</p>
          </div>

          <div className="max-w-xs">
            <SignOutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
