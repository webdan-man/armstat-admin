import useSWR from "swr";
import { fetchContentEntries } from "@/services/contentEntriesService";
import { swrKeys } from "@/lib/swr/cache-keys";
import { useLang } from "@/providers/LangProvider";
import type { ContentEntriesResponse } from "@/types/content-entries";

export function useTranslation() {
  const { activeLang } = useLang();
  const { data } = useSWR<ContentEntriesResponse>(swrKeys.contentEntries, fetchContentEntries);

  function t(key: string, fallback = ""): string {
    if (!data) return fallback;
    const entries = data[activeLang] ?? [];
    const entry = entries.find((e) => e.key === key);
    return entry?.value ?? key;
  }

  return { t, activeLang };
}
