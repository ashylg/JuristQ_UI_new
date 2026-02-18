"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn({ email, password });
    setLoading(false);

    if (!result.ok) {
      setError(result.error || "Unable to sign in");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to Juristiq</CardTitle>
          <CardDescription>Use your account to access the workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-4 text-sm text-slate-600">
            New here? <Link className="text-primary hover:underline" href="/sign-up">Create an account</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
