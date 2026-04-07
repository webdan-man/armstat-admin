import { z } from "zod";

import type { CreateMetricBody, MetricAttributeKey, UpdateMetricBody } from "@/types/metric";
import type { IndicatorFeature } from "@/types/indicator-feature";

const perLangStrings = z.object({
  en: z.string(),
  hy: z.string(),
  ru: z.string(),
});

const perLangBools = z.object({
  en: z.boolean(),
  hy: z.boolean(),
  ru: z.boolean(),
});

const metadataBlock = z.object({
  body: z.string(),
  sourceUrl: z.string(),
});

const chartBlock = z.object({
  link: z.string(),
});

export const indicatorFormSchema = z.object({
  title: perLangStrings,
  description: perLangStrings,
  link: perLangStrings,
  unit: perLangStrings,
  aggregatable: perLangBools,
  metadata: z.object({
    en: metadataBlock,
    hy: metadataBlock,
    ru: metadataBlock,
  }),
  charts: z.tuple([chartBlock, chartBlock]),
  order: z.number().int(),
  attributeKeys: z.array(
    z.object({
      attributeId: z.string().min(1),
      valueIds: z.array(z.string().min(1)),
    })
  ),
});

export type IndicatorFormValues = z.infer<typeof indicatorFormSchema>;

function emptyPerLangStrings(): z.infer<typeof perLangStrings> {
  return { en: "", hy: "", ru: "" };
}

function emptyPerLangBools(): z.infer<typeof perLangBools> {
  return { en: false, hy: false, ru: false };
}

function emptyMetadata(): z.infer<typeof metadataBlock> {
  return {
    body: "",
    sourceUrl: "",
  };
}

export function emptyIndicatorFormValues(): IndicatorFormValues {
  return {
    title: emptyPerLangStrings(),
    description: emptyPerLangStrings(),
    link: emptyPerLangStrings(),
    unit: emptyPerLangStrings(),
    aggregatable: emptyPerLangBools(),
    metadata: {
      en: emptyMetadata(),
      hy: emptyMetadata(),
      ru: emptyMetadata(),
    },
    charts: [{ link: "" }, { link: "" }],
    order: 0,
    attributeKeys: [],
  };
}

/** Мок-дані при виборі індикатора у фільтрах (до появи API). */
export function mockIndicatorFormValues(indicatorId: string): IndicatorFormValues {
  const n = Number.parseInt(indicatorId, 10);
  const suffix = Number.isNaN(n) ? indicatorId : String(n);
  const base = emptyIndicatorFormValues();
  return {
    ...base,
    title: {
      en: `Indicator ${suffix} (EN)`,
      hy: `Ցուցանիշ ${suffix} (HY)`,
      ru: `Показатель ${suffix} (RU)`,
    },
    description: {
      en: `Short description EN — ${suffix}`,
      hy: `Նկարագրություն HY — ${suffix}`,
      ru: `Описание RU — ${suffix}`,
    },
    link: {
      en: `https://example.com/en/${suffix}`,
      hy: `https://example.com/hy/${suffix}`,
      ru: `https://example.com/ru/${suffix}`,
    },
    unit: {
      en: "unit",
      hy: "միավոր",
      ru: "ед.",
    },
    aggregatable: {
      en: n % 2 === 0,
      hy: n % 2 === 1,
      ru: false,
    },
    metadata: {
      en: {
        body: `Metadata body EN for indicator ${suffix}.`,
        sourceUrl: `https://source.example/en/${suffix}`,
      },
      hy: {
        body: `Մետատվյալների տեքստ HY — ${suffix}`,
        sourceUrl: `https://source.example/hy/${suffix}`,
      },
      ru: {
        body: `Метаданные RU — ${suffix}`,
        sourceUrl: `https://source.example/ru/${suffix}`,
      },
    },
    charts: [
      { link: `https://charts.example/${suffix}/1` },
      { link: `https://charts.example/${suffix}/2` },
    ],
    order: Number.isNaN(n) ? 0 : n,
    attributeKeys: [],
  };
}

const localeKeys = ["en", "hy", "ru"] as const;

/** Плоскі об'єкти для API (ключі мов — як очікує бекенд). */
export function mapIndicatorFormToCreateMetric(
  topicId: string,
  values: IndicatorFormValues,
  attributeKeys: MetricAttributeKey[]
): CreateMetricBody {
  const metadata: Record<string, string> = {};
  for (const lang of localeKeys) {
    metadata[lang] = values.metadata[lang].body;
  }

  return {
    topicId,
    title: {
      hy: values.title.hy,
      ru: values.title.ru,
      en: values.title.en,
    },
    description: {
      hy: values.description.hy,
      ru: values.description.ru,
      en: values.description.en,
    },
    metadata,
    attributeKeys,
    order: values.order,
  };
}

export function mapIndicatorFormToUpdateMetric(
  values: IndicatorFormValues,
  attributeKeys: MetricAttributeKey[]
): UpdateMetricBody {
  const metadata: Record<string, string> = {};
  for (const lang of localeKeys) {
    metadata[lang] = values.metadata[lang].body;
  }

  return {
    title: {
      hy: values.title.hy,
      ru: values.title.ru,
      en: values.title.en,
    },
    description: {
      hy: values.description.hy,
      ru: values.description.ru,
      en: values.description.en,
    },
    metadata,
    attributeKeys,
    order: values.order,
  };
}

export function mapFeaturesToMetricAttributeKeys(features: IndicatorFeature[]): MetricAttributeKey[] {
  return features.map((feature) => ({
    attributeId: feature.attributeKey,
    valueIds: feature.valueIds,
  }));
}
