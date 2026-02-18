"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-2 font-normal text-slate-600"
      onClick={async () => {
        if (loading) return;
        setLoading(true);
        await signOut();
        router.replace("/sign-in");
        router.refresh();
      }}
      disabled={loading}
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  );
}
