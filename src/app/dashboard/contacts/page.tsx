"use client";

import { useEffect, useState } from "react";
import { Mail, ShieldUser, UserRound } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, AuthUser } from "@/lib/auth";

export default function ContactsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    void getCurrentUser().then(setUser).catch(() => setUser(null));
  }, []);

  return (
    <div className="p-4 lg:p-6 space-y-4 overflow-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5" />
            Contacts
          </CardTitle>
          <CardDescription>Workspace contact directory (MVP).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {user ? (
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
          ) : (
            <p className="text-sm text-slate-500">Unable to load account contact details.</p>
          )}

          <p className="text-sm text-slate-500">
            Additional shared contacts can be added as the CRM module is expanded.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
