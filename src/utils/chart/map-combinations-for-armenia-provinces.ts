import { MetricCombination } from "@/types/metric";

const provinces = [
  { id: "AM-AG", title: "Արագածոտն" },
  { id: "AM-AR", title: "Արարատ" },
  { id: "AM-AV", title: "Արմավիր" },
  { id: "AM-ER", title: "Երևան" },
  { id: "AM-GR", title: "Գեղարքունիք" },
  { id: "AM-KT", title: "Կոտայք" },
  { id: "AM-LO", title: "Լոռի" },
  { id: "AM-SH", title: "Շիրակ" },
  { id: "AM-SU", title: "Սյունիք" },
  { id: "AM-TV", title: "Տավուշ" },
  { id: "AM-VD", title: "Վայոց Ձոր" },
];

const provinceIdByHyTitle = new Map(provinces.map((p) => [p.title, p.id]));
const provinceHyTitleById = new Map(provinces.map((p) => [p.id, p.title]));

/** ISO-style map id (e.g. AM-ER) → Armenian province title as stored on combination rows. */
export function getArmenianProvinceHyTitleByMapId(mapId: string): string | undefined {
  return provinceHyTitleById.get(mapId);
}

export function filterCombinationsByProvinceMapId(
  combinations: MetricCombination[],
  provinceAttributeId: string,
  provinceMapId: string | null
): MetricCombination[] {
  if (!provinceMapId) return combinations;
  const hyTitle = getArmenianProvinceHyTitleByMapId(provinceMapId);
  if (!hyTitle) return combinations;
  return combinations.filter((item) => {
    const provinceEntry = (item.row ?? []).find((r) => r.attributeId === provinceAttributeId);
    return provinceEntry?.value?.title === hyTitle;
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

    const provinceInHy = provinceEntry?.value?.title;
    const value = Number(item.value) || 0;

    if (!provinceInHy) continue;

    const id = provinceIdByHyTitle.get(provinceInHy);
    if (!id) continue;

    totalsById.set(id, (totalsById.get(id) ?? 0) + value);
  }

  return Array.from(totalsById.entries()).map(([id, value]) => ({ id, value }));
};
