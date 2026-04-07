import type { SectionLocalizedText } from "@/types/section";

export function getSectionLocalizedText(
  value: SectionLocalizedText,
  lang: keyof SectionLocalizedText = "am"
): string {
  return value[lang] || value.am || value.ru || value.en || "";
}
