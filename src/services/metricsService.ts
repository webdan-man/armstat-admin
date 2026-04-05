import apiClient from "@/lib/api/api-client";
import type { IndicatorFormValues } from "@/components/indicators/indicator-form-schema";
import { mockIndicatorFormValues } from "@/components/indicators/indicator-form-schema";
import type { CreateMetricBody } from "@/types/metric";

export async function createMetric(body: CreateMetricBody): Promise<unknown> {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/metrics`;
  return apiClient<unknown>(url, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function mapApiMetricToIndicatorForm(_raw: unknown): IndicatorFormValues | null {
  // TODO: map GET /metrics/:id response when the API contract is fixed
  void _raw;
  return null;
}

/**
 * Loads editor state for an indicator: tries GET /metrics/:id, otherwise placeholder data.
 */
export async function fetchMetricForForm(metricId: string): Promise<IndicatorFormValues> {
  try {
    const raw = await apiClient<unknown>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/metrics/${encodeURIComponent(metricId)}`
    );
    const mapped = mapApiMetricToIndicatorForm(raw);
    if (mapped) return mapped;
  } catch {
    // GET unavailable or 404
  }
  return mockIndicatorFormValues(metricId);
}

/** Wire to POST/PUT publish when the backend exposes it. */
export async function publishMetric(_metricId: string): Promise<void> {
  void _metricId;
  throw new Error("Հրապարակման API-ը դեռ հասանելի չէ։");
}
