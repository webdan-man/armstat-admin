"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { RedirectIfAuthenticated } from "@/components/auth/route-guards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithDemoCredentials } from "@/lib/auth/service";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const login = String(formData.get("login") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = loginWithDemoCredentials({ login, password });

    if (!result.ok) {
      setLoading(false);
      setError(result.error ?? "Login failed.");
      return;
    }

    router.replace(nextPath);
  }

  return (
    <RedirectIfAuthenticated>
      <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Temporary mock auth until backend integration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login">Login</Label>
                <Input id="login" name="login" placeholder="admin" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" name="password" required />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </RedirectIfAuthenticated>
  );
}
