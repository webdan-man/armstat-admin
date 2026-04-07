/**
 * Central SWR cache keys. Use these everywhere you `useSWR`, `mutate`, or
 * `useSWRMutation` so keys stay consistent.
 *
 * For new domains (e.g. indicators), add keys here and call services from
 * `src/services/*` with `useSWR(key, () => serviceFn())` — same pattern as attributes.
 */
export const swrKeys = {
  /** Invalidate after create/update/delete metric; use for metric lists when implemented. */
  metrics: "metrics",
  metricsByTopic: (topicId: string) => ["metrics", "topic", topicId] as const,
  /** Cached indicator form loaded for the editor (GET /metrics/:id or fallback). */
  metricForm: (metricId: string) => ["metrics", "form", metricId] as const,
  attributes: "attributes",
  attributesCategories: "attributesCategories",
  /** useSWRMutation key for CSV export (not a GET cache). */
  attributesExportCsv: ["attributes", "export-csv"] as const,
  sections: "sections",
} as const;
