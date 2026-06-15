import { MetricCombination } from "@/types/metric";

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

const provinceHyTitleById = new Map(provinces.map((p) => [p.id, p.hy]));

/** ISO-style map id (e.g. AM-ER) → Armenian province title. */
export function getArmenianProvinceHyTitleByMapId(mapId: string): string | undefined {
  return provinceHyTitleById.get(mapId);
}

export function filterCombinationsByProvinceMapId(
  combinations: MetricCombination[],
  provinceAttributeId: string,
  provinceMapId: string | null
): MetricCombination[] {
  if (!provinceMapId) return combinations;
  return combinations.filter((item) => {
    const provinceEntry = (item.row ?? []).find((r) => r.attributeId === provinceAttributeId);
    const title = provinceEntry?.value?.title;
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
