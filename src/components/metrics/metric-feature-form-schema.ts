import { z } from "zod";

const trimmedNonEmpty = (message: string) =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, message));

const trimmedString = z.string().transform((s) => s.trim());

export const metricFeatureRowSchema = z.object({
  category: z.string().min(1, "Ընտրեք հատկանիշի կատեգորիան"),
  libraryOption: z.string().min(1, "Ընտրեք գրադարանը"),
  valueIds: z.array(z.string().min(1)).min(1, "Ընտրեք գրադարան արժեքները"),
  label: z.object({
    hy: trimmedNonEmpty("Լրացրեք հայերեն անվանումը"),
    en: trimmedNonEmpty("Լրացրեք անգլերեն անվանումը"),
    ru: trimmedNonEmpty("Լրացրեք ռուսերեն անվանումը"),
  }),
  secondaryLabel: z.object({
    hy: trimmedString,
    en: trimmedString,
    ru: trimmedString,
  }),
});

/** @deprecated use metricFeatureRowSchema */
export const metricFeatureFormSchema = metricFeatureRowSchema;

export const metricFeaturesBatchFormSchema = z.object({
  rows: z.array(metricFeatureRowSchema).min(1, "Ավելացրեք առնվազն մեկ հատկանիշ"),
});

export type MetricFeatureRowValues = z.infer<typeof metricFeatureRowSchema>;
export type MetricFeatureFormValues = MetricFeatureRowValues;
export type MetricFeaturesBatchFormValues = z.infer<typeof metricFeaturesBatchFormSchema>;

export function parseLibraryOption(s: string): { attributeKey: string; valueKey: string } | null {
  const i = s.indexOf(":");
  if (i <= 0 || i === s.length - 1) return null;
  return { attributeKey: s.slice(0, i), valueKey: s.slice(i + 1) };
}

export function emptyMetricFeatureRow(): MetricFeatureRowValues {
  return {
    category: "",
    libraryOption: "",
    valueIds: [],
    label: { hy: "", en: "", ru: "" },
    secondaryLabel: { hy: "", en: "", ru: "" },
  };
}
