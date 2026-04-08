import type { SectionLocalizedText } from "@/types/section";

export function getSectionLocalizedText(
  value: SectionLocalizedText,
  lang: keyof SectionLocalizedText = "hy"
): string {
  return value[lang] || value.hy || (value as { am?: string }).am || value.ru || value.en || "";
}
