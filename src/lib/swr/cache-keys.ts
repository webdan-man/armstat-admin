/**
 * Central SWR cache keys. Use these everywhere you `useSWR`, `mutate`, or
 * `useSWRMutation` so keys stay consistent.
 *
 * For new domains (e.g. metrics), add keys here and call services from
 * `src/services/*` with `useSWR(key, () => serviceFn())` — same pattern as attributes.
 */
import { defaultLocale, type Locale } from "@/lib/i18n";

export const swrKeys = {
  /** Invalidate after create/update/delete metric; use for metric lists when implemented. */
  metrics: "metrics",
  metricsByTopic: (topicId: string) => ["metrics", "topic", topicId] as const,
  /** Cached metric form loaded for the editor (GET /metrics/:id or fallback). */
  metricForm: (metricId: string) => ["metrics", "form", metricId] as const,
  /** Cached combination rows for the data table (GET combinations API). */
  metricCombinations: (metricId: string, locale: Locale = defaultLocale) =>
    ["metrics", "combinations", metricId, locale] as const,
  attributes: "attributes",
  attributesCategories: "attributesCategories",
  /** useSWRMutation key for CSV export (not a GET cache). */
  attributesExportCsv: ["attributes", "export-csv"] as const,
  sections: "sections",
  /** Base prefix for paginated news list (used by useSWRInfinite). */
  newsList: ["news", "list"] as const,
  contentEntries: "contentEntries",
} as const;
