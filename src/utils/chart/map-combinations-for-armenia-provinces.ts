import { MetricCombination } from "@/types/metric";
import { defaultLocale, type Locale } from "@/lib/i18n";

const provinces = [
  { id: "AM-AG", hy: "Արագածոտն", en: "Aragatsotn", ru: "Арагацотн" },
  { id: "AM-AR", hy: "Արարատ", en: "Ararat", ru: "Арарат" },
  { id: "AM-AV", hy: "Արմավիր", en: "Armavir", ru: "Армавир" },
  { id: "AM-ER", hy: "Երևան", en: "Yerevan", ru: "Ереван" },
  { id: "AM-GR", hy: "Գեղարքունիք", en: "Gegharkunik", ru: "Гегаркуник" },
  { id: "AM-KT", hy: "Կոտայք", en: "Kotayk", ru: "Котайк" },
  { id: "AM-LO", hy: "Լոռի", en: "Lori", ru: "Лори" },
  { id: "AM-SH", hy: "Շիրակ", en: "Shirak", ru: "Ширак" },
  { id: "AM-SU", hy: "Սյունիք", en: "Syunik", ru: "Сюник" },
  { id: "AM-TV", hy: "Տավուշ", en: "Tavush", ru: "Тавуш" },
  { id: "AM-VD", hy: "Վայոց Ձոր", en: "Vayots Dzor", ru: "Вайоц Дзор" },
];

/**
 * Province title (in any supported locale) → ISO-style map id. Combination rows
 * carry titles in the active locale, so matching must accept hy/en/ru — keying
 * on Armenian only made every province resolve to 0 under en/ru.
 */
const provinceIdByAnyTitle = new Map<string, string>();
for (const p of provinces) {
  provinceIdByAnyTitle.set(p.hy, p.id);
  provinceIdByAnyTitle.set(p.en, p.id);
  provinceIdByAnyTitle.set(p.ru, p.id);
}

const provinceById = new Map(provinces.map((p) => [p.id, p]));

/**
 * Localized titles of the national "Armenia" aggregate value. The province
 * dimension can carry this as a pre-computed country-wide total alongside the
 * 11 individual provinces.
 */
const ARMENIA_TITLE_BY_LOCALE: Record<Locale, string> = {
  hy: "Հայաստան",
  en: "Armenia",
  ru: "Армения",
};

const ARMENIA_TITLES = new Set(Object.values(ARMENIA_TITLE_BY_LOCALE));

const isArmeniaTitle = (title: string | undefined): boolean =>
  title ? ARMENIA_TITLES.has(title) : false;

/** National "Armenia" title in the active locale (the default, no-province view). */
export function getArmeniaTitle(locale: Locale = defaultLocale): string {
  return ARMENIA_TITLE_BY_LOCALE[locale] ?? ARMENIA_TITLE_BY_LOCALE[defaultLocale];
}

/** ISO-style map id (e.g. AM-ER) → province title in the active locale. */
export function getProvinceTitleByMapId(
  mapId: string,
  locale: Locale = defaultLocale
): string | undefined {
  return provinceById.get(mapId)?.[locale];
}

export function filterCombinationsByProvinceMapId(
  combinations: MetricCombination[],
  provinceAttributeId: string,
  provinceMapId: string | null
): MetricCombination[] {
  const provinceTitleOf = (item: MetricCombination) =>
    (item.row ?? []).find((r) => r.attributeId === provinceAttributeId)?.value?.title;

  // No province selected/hovered: show the national total. When the dataset
  // carries an explicit "Armenia" row, use it directly — summing the 11
  // provinces on top of it would double-count, since both co-exist.
  if (!provinceMapId) {
    const armeniaRows = combinations.filter((item) => isArmeniaTitle(provinceTitleOf(item)));
    return armeniaRows.length ? armeniaRows : combinations;
  }

  return combinations.filter((item) => {
    const title = provinceTitleOf(item);
    return title ? provinceIdByAnyTitle.get(title) === provinceMapId : false;
  });
}

export const mapCombinationsForArmeniaProvinces = (
  combinations: MetricCombination[],
  provinceAttributeId?: string
) => {
  const totalsById = new Map<string, number>();

  for (const item of combinations) {
    const provinceEntry = provinceAttributeId
      ? (item.row ?? []).find((r) => r.attributeId === provinceAttributeId)
      : item.row?.[0];

    const provinceTitle = provinceEntry?.value?.title;
    const value = Number(item.value) || 0;

    if (!provinceTitle) continue;

    const id = provinceIdByAnyTitle.get(provinceTitle);
    if (!id) continue;

    totalsById.set(id, (totalsById.get(id) ?? 0) + value);
  }

  return Array.from(totalsById.entries()).map(([id, value]) => ({ id, value }));
};
