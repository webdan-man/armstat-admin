export const yearTotalsToLineData = (
  yearTotals: Map<string, number>
): { date: number; value: number }[] => {
  const lineData = Array.from(yearTotals.entries())
    .map(([year, value]) => {
      const date = new Date(Number(year), 0, 1);
      const time = date.getTime();
      if (!Number.isFinite(time)) return null;
      return { date: time, value };
    })
    .filter(Boolean) as { date: number; value: number }[];

  return lineData.sort((a, b) => a.date - b.date);
};
