"use client";

import { clearSession, getSession, saveSession } from "@/lib/auth/storage";
import type { AuthSession, LoginInput, UserRole } from "@/lib/auth/types";

const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

function resolveRole(login: string): UserRole {
  return login === "admin" ? "admin" : "editor";
}

export function loginWithDemoCredentials(input: LoginInput): {
  ok: boolean;
  error?: string;
} {
  const demoLogin = process.env.NEXT_PUBLIC_DEMO_LOGIN;
  const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD;

  if (!demoLogin || !demoPassword) {
    return {
      ok: false,
      error: "Demo credentials are not configured in environment variables.",
    };
  }

  if (input.login !== demoLogin || input.password !== demoPassword) {
    return {
      ok: false,
      error: "Invalid login or password.",
    };
  }

  const session: AuthSession = {
    isAuthenticated: true,
    userId: input.login,
    role: resolveRole(input.login),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  // TODO: Replace with httpOnly cookie-based session after backend auth integration.
  saveSession(session);

  return { ok: true };
}

export function logout(): void {
  clearSession();
}

export function getCurrentSession(): AuthSession | null {
  return getSession();
}
