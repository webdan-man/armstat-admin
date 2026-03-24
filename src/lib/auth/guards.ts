"use client";

import { getCurrentSession } from "@/lib/auth/service";
import type { UserRole } from "@/lib/auth/types";

export function isAuthenticated(): boolean {
  return Boolean(getCurrentSession());
}

export function hasRequiredRole(required: UserRole): boolean {
  const session = getCurrentSession();
  if (!session) {
    return false;
  }

  if (required === "editor") {
    return session.role === "editor" || session.role === "admin";
  }

  return session.role === required;
}
