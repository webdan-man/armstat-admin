"use client";

import Filters from "@/components/metrics/Filters";
import MetricsForm from "@/components/metrics/MetricsForm";
import { useMetricFilters } from "@/components/metrics/metric-filters-context";

export default function MetricsContent() {
  const { isFormVisible } = useMetricFilters();

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex min-h-11 items-center justify-between bg-[#f9fafb] pt-7 pb-4">
        <h1 className="justify-start text-xl leading-4 font-semibold text-zinc-800">Ցուցանիշներ</h1>
      </div>
      <Filters />
      {isFormVisible && <MetricsForm />}
    </div>
  );
}
