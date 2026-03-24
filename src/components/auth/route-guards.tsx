"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { isAuthenticated } from "@/lib/auth/guards";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [resolved, setResolved] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setResolved(true);
  }, []);

  useEffect(() => {
    if (resolved && !authenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [resolved, authenticated, pathname, router]);

  if (!resolved) {
    return <div>Checking session...</div>;
  }

  if (!authenticated) {
    return <div>Checking session...</div>;
  }

  return <>{children}</>;
}

export function RedirectIfAuthenticated({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [resolved, setResolved] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setResolved(true);
  }, []);

  useEffect(() => {
    if (resolved && authenticated) {
      router.replace("/admin");
    }
  }, [resolved, authenticated, router]);

  if (!resolved) {
    return <div>Preparing login...</div>;
  }

  if (authenticated) {
    return <div>Preparing login...</div>;
  }

  return <>{children}</>;
}
