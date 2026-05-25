import { z } from "zod";

const trimmedString = z.string().transform((s) => s.trim());

const perLangStrings = z.object({
  hy: trimmedString,
  en: trimmedString,
  ru: trimmedString,
});

const localeKeys = ["hy", "en", "ru"] as const;

const hasAnyLangText = (value: z.infer<typeof perLangStrings>) =>
  localeKeys.some((lang) => value[lang].length > 0);

const requireAtLeastOneLang = (
  value: z.infer<typeof perLangStrings>,
  pathPrefix: "label" | "secondaryLabel",
  message: string,
  ctx: z.RefinementCtx
) => {
  if (hasAnyLangText(value)) return;

  for (const lang of localeKeys) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [pathPrefix, lang],
      message,
    });
  }
};

export const indicatorFeatureRowSchema = z
  .object({
    category: z.string().min(1, "Ընտրեք հատկանիշի կատեգորիան"),
    libraryOption: z.string().min(1, "Ընտրեք գրադարանը"),
    levelOption: z.string().min(1, "Ընտրեք մակարդակը"),
    valueIds: z.array(z.string().min(1)).min(1, "Ընտրեք գրադարան արժեքները"),
    label: perLangStrings,
    secondaryLabel: perLangStrings,
  })
  .superRefine((row, ctx) => {
    requireAtLeastOneLang(row.label, "label", "Լրացրեք անվանումը (առնվազն մեկ լեզվով)", ctx);

    if (row.levelOption !== "secondary") return;

    requireAtLeastOneLang(
      row.secondaryLabel,
      "secondaryLabel",
      "Լրացրեք երկրորդային անվանումը (առնվազն մեկ լեզվով)",
      ctx
    );
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
    label: { hy: "", en: "", ru: "" },
    secondaryLabel: { hy: "", en: "", ru: "" },
  };
}
