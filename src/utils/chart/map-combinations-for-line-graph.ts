import { MetricCombination } from "@/types/metric";

export const mapCombinationsForLineGraph = (combinations: MetricCombination[]) => {
  const data = combinations
    .map((item) => {
      const year = item.row?.[0]?.value?.title;
      const value = Number(item.value);

      if (!year || isNaN(value)) return null;

      const date = new Date(Number(year), 0, 1); // Jan 1 of that year

      return {
        date: date.getTime(),
        value,
      };
    })
    .filter(Boolean) as { date: number; value: number }[];

  return data.sort((a, b) => a.date - b.date);
};
