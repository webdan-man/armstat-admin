import { z } from "zod";

export const indicatorFeatureRowSchema = z.object({
  name: z.string().trim().min(1, "Մուտքագրեք անվանումը"),
  category: z.string().min(1, "Ընտրեք տեսակը"),
  libraryOption: z.string().min(1, "Ընտրեք գրադարանը"),
});

/** @deprecated use indicatorFeatureRowSchema */
export const indicatorFeatureFormSchema = indicatorFeatureRowSchema;

export const indicatorFeaturesBatchFormSchema = z.object({
  rows: z.array(indicatorFeatureRowSchema).min(1, "Ավելացրեք առնվազն մեկ հատկանիշ"),
});

export type IndicatorFeatureRowValues = z.infer<typeof indicatorFeatureRowSchema>;
export type IndicatorFeatureFormValues = IndicatorFeatureRowValues;
export type IndicatorFeaturesBatchFormValues = z.infer<typeof indicatorFeaturesBatchFormSchema>;

export function parseLibraryOption(s: string): { attributeKey: string; valueKey: string } | null {
  const i = s.indexOf(":");
  if (i <= 0 || i === s.length - 1) return null;
  return { attributeKey: s.slice(0, i), valueKey: s.slice(i + 1) };
}

export function emptyIndicatorFeatureRow(): IndicatorFeatureRowValues {
  return {
    name: "",
    category: "",
    libraryOption: "",
  };
}
