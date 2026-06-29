import apiClient from "@/lib/api/api-client";
import { defaultLocale, type Locale } from "@/lib/i18n";
import type { MetricFormValues } from "@/components/metrics/metric-form-schema";
import { emptyMetricFormValues } from "@/components/metrics/metric-form-schema";
import {
  CreateMetricBody,
  MetricAttribute,
  MetricAttributeFromApi,
  MetricCombination,
  MetricResponse,
  MetricSelectOption,
  UpdateMetricBody,
} from "@/types/metric";
import type { MetricFeature } from "@/types/metric-feature";

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

export async function deleteMetric(metricId: string): Promise<void> {
  await apiClient<void>(`/api/metrics/${encodeURIComponent(metricId)}`, {
    method: "DELETE",
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

function mapApiMetricToMetricForm(raw: MetricResponse): MetricFormValues {
  const empty = emptyMetricFormValues();
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
  const readTotalPerLang = (value: Record<string, string> | undefined) => {
    const v = value ?? {};
    return {
      en: typeof v.en === "string" ? v.en : "",
      hy: typeof v.hy === "string" ? v.hy : typeof v.am === "string" ? v.am : "",
      ru: typeof v.ru === "string" ? v.ru : "",
    };
  };

  return {
    ...empty,
    topicId: raw.topicId ?? "",
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
    isCumulative: raw.isCumulative === true,
    total: {
      male: readTotalPerLang(raw.total?.male),
      female: readTotalPerLang(raw.total?.female),
    },
    attributes: normalizeMetricAttributesFromApi(raw.attributes),
  };
}

export async function getMetricById(metricId: string): Promise<MetricResponse> {
  return apiClient<MetricResponse>(`/api/metrics/${encodeURIComponent(metricId)}`);
}

export async function fetchMetricsByTopicId(
  topicId: string,
  options?: { published?: boolean }
): Promise<MetricSelectOption[]> {
  const params = new URLSearchParams({ topicId });
  if (options?.published !== undefined) {
    params.set("published", String(options.published));
  }
  const data = await apiClient<MetricResponse[]>(`/api/metrics?${params.toString()}`);

  return data.map((metric) => ({
    id: metric._id,
    label: pickMetricTitle(metric.title),
    title: metric.title ?? {},
    updatedAt: metric.updatedAt ?? metric.createdAt ?? null,
    publishedAt: metric.publishedAt ?? null,
  }));
}

export async function fetchMetricForForm(metricId: string): Promise<{
  metric: MetricResponse;
  form: MetricFormValues;
  features: MetricFeature[];
}> {
  const raw = await getMetricById(metricId);

  const result = {
    metric: raw,
    form: mapApiMetricToMetricForm(raw),
    features: mapMetricAttributesToFeatures(raw.attributes ?? []),
  };

  return result;
}

function hasSecondaryLabelContent(
  secondaryLabel: MetricAttributeFromApi["secondaryLabel"]
): boolean {
  return [secondaryLabel?.hy, secondaryLabel?.en, secondaryLabel?.ru].some(
    (value) => typeof value === "string" && value.trim().length > 0
  );
}

function mapMetricAttributesToFeatures(attributes: MetricAttributeFromApi[]): MetricFeature[] {
  const features: MetricFeature[] = [];

  attributes.forEach((item, index) => {
    const label = {
      hy: typeof item.label?.hy === "string" ? item.label.hy.trim() : "",
      en: typeof item.label?.en === "string" ? item.label.en.trim() : "",
      ru: typeof item.label?.ru === "string" ? item.label.ru.trim() : "",
    };
    const secondaryLabel = {
      hy: typeof item.secondaryLabel?.hy === "string" ? item.secondaryLabel.hy.trim() : "",
      en: typeof item.secondaryLabel?.en === "string" ? item.secondaryLabel.en.trim() : "",
      ru: typeof item.secondaryLabel?.ru === "string" ? item.secondaryLabel.ru.trim() : "",
    };
    const base = {
      category: "",
      attributeKey: item.attributeId,
      attributeKeyLabel: "",
      valueIds: item.valueIds ?? [],
      libraryDisplay: "",
      label,
      secondaryLabel,
    };

    features.push({
      ...base,
      id: `${item.attributeId}-primary-${index}`,
      level: "primary",
    });

    if (hasSecondaryLabelContent(item.secondaryLabel)) {
      features.push({
        ...base,
        id: `${item.attributeId}-secondary-${index}`,
        level: "secondary",
      });
    }
  });

  return features;
}

function pickMetricTitle(title: MetricResponse["title"]): string {
  if (!title) return "—";
  if (typeof title.hy === "string" && title.hy.trim().length > 0) return title.hy;
  if (typeof title.ru === "string" && title.ru.trim().length > 0) return title.ru;
  if (typeof title.en === "string" && title.en.trim().length > 0) return title.en;
  return "—";
}

export async function publishMetric(metricId: string, published: boolean): Promise<void> {
  await apiClient<void>(`/api/metrics/${encodeURIComponent(metricId)}/publish`, {
    method: "PATCH",
    body: JSON.stringify({ published }),
  });
}

export async function uploadMetricCsv(metricId: string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  await apiClient<unknown>(`/api/metrics/${encodeURIComponent(metricId)}/csv?locale=hy`, {
    method: "POST",
    body: formData,
  });
}

export async function downloadMetricCombinationsCSV(
  metricId: string,
  metricName: string,
  locale: string
): Promise<void> {
  const csvText = await apiClient<string>(`/api/metrics/${metricId}/csv?locale=${locale}`, {
    headers: { Accept: "text/csv" },
    parseAsText: true,
  });

  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${metricName}.csv`;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadMetricCombinationsPDF(
  metricId: string,
  metricName: string,
  locale: string
): Promise<void> {
  const blob = await apiClient<any>(
    `/api/metrics/${metricId}/pdf?locale=${locale}&url=${window.location.href}`,
    {
      parseAsBlob: true,
    }
  );

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${metricName}.pdf`);

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function recordMetricView(metricId: string): Promise<void> {
  await apiClient<unknown>(`/api/metrics/${encodeURIComponent(metricId)}/view`, {
    method: "POST",
  });
}

export async function getMetricCombinations(
  metricId: string,
  locale: Locale = defaultLocale
): Promise<MetricCombination[]> {
  return apiClient<MetricCombination[]>(
    `/api/metrics/${encodeURIComponent(metricId)}/combinations?locale=${encodeURIComponent(locale)}`
  );
}
