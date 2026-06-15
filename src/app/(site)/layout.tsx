import React from "react";
import Header from "@/components/site/Header";
import { SWRProvider } from "@/providers/SWRProvider";
import { LangProvider } from "@/providers/LangProvider";
import { getActiveLocale } from "@/lib/get-active-locale";
import { swrKeys } from "@/lib/swr/cache-keys";
import type { ContentEntriesResponse } from "@/types/content-entries";

/** Fetch translation entries on the server so the first paint already has them. */
async function getContentEntries(): Promise<ContentEntriesResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) return null;

  const res = await fetch(`${baseUrl}/content-entries`, { cache: "no-store" });
  if (!res.ok) return null;

  return (await res.json()) as ContentEntriesResponse;
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [entries, lang] = await Promise.all([getContentEntries(), getActiveLocale()]);

  return (
    <SWRProvider
      fallback={entries ? { [swrKeys.contentEntries]: entries } : undefined}
    >
      <LangProvider initialLang={lang}>
        <div className="flex min-h-screen items-center justify-center bg-lightTone1 text-textBlack100 text-fontSizeM font-normal tracking-[-0.03em] leading-[1.5] dark:bg-black">
          <main className="flex min-h-screen w-full flex-col">
            <Header />
            {children}
          </main>
        </div>
      </LangProvider>
    </SWRProvider>
  );
}
