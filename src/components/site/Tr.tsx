"use client";

import { useTranslation } from "@/hooks/useTranslation";

/**
 * Renders a translated static label inside server components. Uses the client
 * `useTranslation` hook, so it reads the active locale from the provider.
 */
export function Tr({ k, fallback = "" }: { k: string; fallback?: string }) {
  const { t } = useTranslation();
  return <>{t(k, fallback)}</>;
}
