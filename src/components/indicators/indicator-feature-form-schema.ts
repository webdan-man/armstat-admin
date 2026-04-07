import { z } from "zod";

export const indicatorFeatureRowSchema = z.object({
  category: z.string().min(1, "Ընտրեք տեսակը"),
  libraryOption: z.string().min(1, "Ընտրեք գրադարանը"),
  levelOption: z.string().min(1, "Ընտրեք մակարդակը"),
  valueIds: z.array(z.string().min(1)).min(1, "Ընտրեք գրադարան արժեքները"),
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
    category: "",
    libraryOption: "",
    levelOption: "",
    valueIds: [],
  };
}
