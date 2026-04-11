import apiClient from "@/lib/api/api-client";
import type { IndicatorFormValues } from "@/components/indicators/indicator-form-schema";
import { emptyIndicatorFormValues } from "@/components/indicators/indicator-form-schema";
import {
  CreateMetricBody,
  MetricAttribute,
  MetricAttributeFromApi,
  MetricCombination,
  MetricResponse,
  MetricSelectOption,
  UpdateMetricBody,
} from "@/types/metric";
import type { IndicatorFeature } from "@/types/indicator-feature";

export async function createMetric(body: CreateMetricBody): Promise<MetricResponse> {
  const url = "/api/metrics";
  return apiClient<MetricResponse>(url, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function patchMetric(
  metricId: string,
  body: UpdateMetricBody
): Promise<MetricResponse> {
  return apiClient<MetricResponse>(`/api/metrics/${encodeURIComponent(metricId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

function normalizeMetricAttributesFromApi(
  raw: MetricAttributeFromApi[] | undefined
): MetricAttribute[] {
  return (raw ?? []).map((a) => ({
    attributeId: a.attributeId,
    valueIds: a.valueIds ?? [],
    label: {
      hy: typeof a.label?.hy === "string" ? a.label.hy.trim() : "",
      en: typeof a.label?.en === "string" ? a.label.en.trim() : "",
      ru: typeof a.label?.ru === "string" ? a.label.ru.trim() : "",
    },
    secondaryLabel: {
      hy: typeof a.secondaryLabel?.hy === "string" ? a.secondaryLabel.hy.trim() : "",
      en: typeof a.secondaryLabel?.en === "string" ? a.secondaryLabel.en.trim() : "",
      ru: typeof a.secondaryLabel?.ru === "string" ? a.secondaryLabel.ru.trim() : "",
    },
  }));
}

function mapApiMetricToIndicatorForm(raw: MetricResponse): IndicatorFormValues {
  const empty = emptyIndicatorFormValues();
  const title = raw.title ?? {};
  const description = raw.description ?? {};
  const unit = raw.unit ?? {};
  const link = raw.link ?? {};
  const metadata = raw.metadata ?? {};
  const readMetadataBody = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object" && "body" in value) {
      return String((value as Record<string, unknown>).body ?? "");
    }
    return "";
  };
  const readMetadataSourceUrl = (value: unknown): string => {
    if (value && typeof value === "object" && "sourceUrl" in value) {
      return String((value as Record<string, unknown>).sourceUrl ?? "");
    }
    return "";
  };

  return {
    ...empty,
    title: {
      en: typeof title.en === "string" ? title.en : "",
      hy: typeof title.hy === "string" ? title.hy : typeof title.am === "string" ? title.am : "",
      ru: typeof title.ru === "string" ? title.ru : "",
    },
    description: {
      en: typeof description.en === "string" ? description.en : "",
      hy:
        typeof description.hy === "string"
          ? description.hy
          : typeof description.am === "string"
            ? description.am
            : "",
      ru: typeof description.ru === "string" ? description.ru : "",
    },
    link: {
      en: typeof link.en === "string" ? link.en : "",
      hy: typeof link.hy === "string" ? link.hy : typeof link.am === "string" ? link.am : "",
      ru: typeof link.ru === "string" ? link.ru : "",
    },
    unit: {
      en: typeof unit.en === "string" ? unit.en : "",
      hy: typeof unit.hy === "string" ? unit.hy : typeof unit.am === "string" ? unit.am : "",
      ru: typeof unit.ru === "string" ? unit.ru : "",
    },
    metadata: {
      en: {
        body: readMetadataBody(metadata.en),
        sourceUrl: readMetadataSourceUrl(metadata.en),
      },
      hy: {
        body: readMetadataBody(metadata.hy ?? metadata.am),
        sourceUrl: readMetadataSourceUrl(metadata.hy ?? metadata.am),
      },
      ru: {
        body: readMetadataBody(metadata.ru),
        sourceUrl: readMetadataSourceUrl(metadata.ru),
      },
    },
    order: typeof raw.order === "number" ? raw.order : 0,
    attributes: normalizeMetricAttributesFromApi(raw.attributes),
  };
}

export async function getMetricById(metricId: string): Promise<MetricResponse> {
  return apiClient<MetricResponse>(`/api/metrics/${encodeURIComponent(metricId)}`);
}

export async function fetchMetricsByTopicId(topicId: string): Promise<MetricSelectOption[]> {
  const data = await apiClient<MetricResponse[]>(
    `/api/metrics?topicId=${encodeURIComponent(topicId)}`
  );

  return data.map((metric) => ({
    id: metric._id,
    label: pickMetricTitle(metric.title),
    updatedAt: metric.updatedAt ?? metric.createdAt ?? null,
  }));
}

export async function fetchMetricForForm(metricId: string): Promise<{
  metric: MetricResponse;
  form: IndicatorFormValues;
  features: IndicatorFeature[];
}> {
  const raw = await getMetricById(metricId);
  return {
    metric: raw,
    form: mapApiMetricToIndicatorForm(raw),
    features: mapMetricAttributesToFeatures(raw.attributes ?? []),
  };
}

function mapMetricAttributesToFeatures(attributes: MetricAttributeFromApi[]): IndicatorFeature[] {
  return attributes.map((item, index) => ({
    id: `${item.attributeId}-${index}`,
    category: "",
    attributeKey: item.attributeId,
    attributeKeyLabel: "",
    level: "primary",
    valueIds: item.valueIds ?? [],
    libraryDisplay: "",
    label: {
      hy: typeof item.label?.hy === "string" ? item.label.hy.trim() : "",
      en: typeof item.label?.en === "string" ? item.label.en.trim() : "",
      ru: typeof item.label?.ru === "string" ? item.label.ru.trim() : "",
    },
    secondaryLabel: {
      hy: typeof item.secondaryLabel?.hy === "string" ? item.secondaryLabel.hy.trim() : "",
      en: typeof item.secondaryLabel?.en === "string" ? item.secondaryLabel.en.trim() : "",
      ru: typeof item.secondaryLabel?.ru === "string" ? item.secondaryLabel.ru.trim() : "",
    },
  }));
}

function pickMetricTitle(title: MetricResponse["title"]): string {
  if (!title) return "—";
  if (typeof title.hy === "string" && title.hy.trim().length > 0) return title.hy;
  if (typeof title.ru === "string" && title.ru.trim().length > 0) return title.ru;
  if (typeof title.en === "string" && title.en.trim().length > 0) return title.en;
  return "—";
}

/** Wire to POST/PUT publish when the backend exposes it. */
export async function publishMetric(_metricId: string): Promise<void> {
  void _metricId;
  throw new Error("Հրապարակման API-ը դեռ հասանելի չէ։");
}

export async function uploadMetricCsv(metricId: string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  await apiClient<unknown>(`/api/metrics/${encodeURIComponent(metricId)}/csv?locale=hy`, {
    method: "POST",
    body: formData,
  });
}

export async function downloadMetricCombinationsCSV(metricId: string): Promise<void> {
  const csvText = await apiClient<string>(`/api/metrics/${metricId}/csv?locale=hy`, {
    headers: { Accept: "text/csv" },
    parseAsText: true,
  });

  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${metricId}-combinations.csv`;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function getMetricCombinations(metricId: string): Promise<MetricCombination[]> {
  return apiClient<MetricCombination[]>(
    `/api/metrics/${encodeURIComponent(metricId)}/combinations?locale=hy`
  );
}
