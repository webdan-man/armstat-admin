import { z } from "zod";

import type {
  CreateMetricBody,
  MetricAttribute,
  MetricTotal,
  UpdateMetricBody,
} from "@/types/metric";
import type { MetricFeature } from "@/types/metric-feature";

const perLangStrings = z.object({
  en: z.string(),
  hy: z.string(),
  ru: z.string(),
});

const metadataBlock = z.object({
  body: z.string(),
  sourceUrl: z.string(),
});

const chartBlock = z.object({
  link: z.string(),
});

const metricTotalFormBlock = z.object({
  male: z.string().optional(),
  female: z.string().optional(),
  malePercentage: z.string(),
  femalePercentage: z.string(),
});

/** Залишає лише цифри; порожній рядок → 0 (для API). */
export function parseMetricTotalForApi(total: z.infer<typeof metricTotalFormBlock>): MetricTotal {
  const toNumber = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return 0;
    const n = Number.parseInt(digits, 10);
    return Number.isFinite(n) ? n : 0;
  };
  return {
    male: 0,
    female: 0,
    malePercentage: total.malePercentage.trim(),
    femalePercentage: total.femalePercentage.trim(),
  };
}

const trimmedNonEmpty = (message: string) =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, message));

const trimmedString = z.string().transform((s) => s.trim());

// Armenian (hy) is the primary language and is the only one required per block.
// Once a block is filled in Armenian, the other languages stay optional.
const requiredPerLangStrings = z.object({
  hy: trimmedNonEmpty("Պարտադիր (հայ.)"),
  en: trimmedString,
  ru: trimmedString,
});

const requiredMetadataBlock = z.object({
  body: trimmedNonEmpty("Պարտադիր"),
  sourceUrl: trimmedNonEmpty("Պարտադիր"),
});

const optionalMetadataBlock = z.object({
  body: trimmedString,
  sourceUrl: trimmedString,
});

export const metricFormSchema = z.object({
  topicId: trimmedNonEmpty("Ընտրեք թեման"),
  // UI-only: remembers the chosen section while no topic is selected yet. Not sent to the API.
  sectionId: trimmedNonEmpty("Ընտրեք բաժինը"),
  title: requiredPerLangStrings,
  description: requiredPerLangStrings,
  link: requiredPerLangStrings,
  unit: requiredPerLangStrings,
  isCumulative: z.boolean(),
  metadata: z.object({
    en: optionalMetadataBlock,
    hy: requiredMetadataBlock,
    ru: optionalMetadataBlock,
  }),
  charts: z.tuple([chartBlock, chartBlock]),
  order: z.number().int(),
  total: metricTotalFormBlock,
  attributes: z.array(
    z.object({
      attributeId: z.string().min(1),
      valueIds: z.array(z.string().min(1)),
      label: z.object({
        hy: trimmedNonEmpty("Լրացրեք հայերեն պիտակը"),
        en: trimmedString,
        ru: trimmedString,
      }),
      secondaryLabel: z.object({
        hy: trimmedString,
        en: trimmedString,
        ru: trimmedString,
      }),
    })
  ),
});

export type MetricFormValues = z.infer<typeof metricFormSchema>;

function emptyPerLangStrings(): z.infer<typeof perLangStrings> {
  return { en: "", hy: "", ru: "" };
}

function emptyMetadata(): z.infer<typeof metadataBlock> {
  return {
    body: "",
    sourceUrl: "",
  };
}

export function emptyMetricFormValues(): MetricFormValues {
  return {
    topicId: "",
    sectionId: "",
    title: emptyPerLangStrings(),
    description: emptyPerLangStrings(),
    link: emptyPerLangStrings(),
    unit: emptyPerLangStrings(),
    isCumulative: false,
    metadata: {
      en: emptyMetadata(),
      hy: emptyMetadata(),
      ru: emptyMetadata(),
    },
    charts: [{ link: "" }, { link: "" }],
    order: 0,
    total: { male: "", female: "", malePercentage: "", femalePercentage: "" },
    attributes: [],
  };
}

/** Мок-дані при виборі індикатора у фільтрах (до появи API). */
export function mockMetricFormValues(metricId: string): MetricFormValues {
  const n = Number.parseInt(metricId, 10);
  const suffix = Number.isNaN(n) ? metricId : String(n);
  const base = emptyMetricFormValues();
  return {
    ...base,
    title: {
      en: `Metric ${suffix} (EN)`,
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
    isCumulative: n % 2 === 0,
    metadata: {
      en: {
        body: `Metadata body EN for metric ${suffix}.`,
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
    attributes: [],
  };
}

const localeKeys = ["en", "hy", "ru"] as const;

/** Плоскі об'єкти для API (ключі мов — як очікує бекенд). */
export function mapMetricFormToCreateMetric(
  topicId: string,
  values: MetricFormValues,
  attributes: MetricAttribute[]
): CreateMetricBody {
  const metadata: Record<string, { body: string; sourceUrl: string }> = {};
  for (const lang of localeKeys) {
    metadata[lang] = {
      body: values.metadata[lang].body,
      sourceUrl: values.metadata[lang].sourceUrl,
    };
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
    unit: {
      hy: values.unit.hy,
      ru: values.unit.ru,
      en: values.unit.en,
    },
    metadata,
    attributes,
    order: values.order,
    total: parseMetricTotalForApi(values.total),
    isCumulative: values.isCumulative,
  };
}

export function mapMetricFormToUpdateMetric(
  values: MetricFormValues,
  attributes: MetricAttribute[]
): UpdateMetricBody {
  const metadata: Record<string, { body: string; sourceUrl: string }> = {};
  for (const lang of localeKeys) {
    metadata[lang] = {
      body: values.metadata[lang].body,
      sourceUrl: values.metadata[lang].sourceUrl,
    };
  }

  return {
    ...(values.topicId ? { topicId: values.topicId } : {}),
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
    unit: {
      hy: values.unit.hy,
      ru: values.unit.ru,
      en: values.unit.en,
    },
    link: {
      hy: values.link.hy,
      ru: values.link.ru,
      en: values.link.en,
    },
    metadata,
    attributes,
    order: values.order,
    total: parseMetricTotalForApi(values.total),
    isCumulative: values.isCumulative,
  };
}

export function mapFeaturesToMetricAttributeKeys(features: MetricFeature[]): MetricAttribute[] {
  const seen = new Set<string>();
  const result: MetricAttribute[] = [];

  for (const feature of features) {
    const dedupeKey = `${feature.attributeKey}::${[...feature.valueIds].sort().join(",")}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    result.push({
      attributeId: feature.attributeKey,
      valueIds: feature.valueIds,
      label: {
        hy: feature.label.hy.trim(),
        en: feature.label.en.trim(),
        ru: feature.label.ru.trim(),
      },
      secondaryLabel: {
        hy: feature.secondaryLabel.hy.trim(),
        en: feature.secondaryLabel.en.trim(),
        ru: feature.secondaryLabel.ru.trim(),
      },
    });
  }

  return result;
}
