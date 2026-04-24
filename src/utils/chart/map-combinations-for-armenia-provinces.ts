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
