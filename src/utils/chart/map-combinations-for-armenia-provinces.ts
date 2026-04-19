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

export const mapCombinationsForArmeniaProvinces = (combinations: MetricCombination[]) => {


  return combinations
    .map((item) => {
      const provinceInHy = item.row?.[0]?.value?.title;
      const value = Number(item.value);
      const province = provinces.find((province) => province.title === provinceInHy);

      return province
        ? {
            id: province.id,
            value,
          }
        : undefined;
    })
    .filter(Boolean) as { id: string; value: number }[];
};
