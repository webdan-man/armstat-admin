"use client";

import React from "react";

import Filters from "@/components/indicators/Filters";
import IndicatorsForm from "@/components/indicators/IndicatorsForm";
import { IndicatorFeaturesProvider } from "@/components/indicators/indicator-features-context";
import { IndicatorFiltersProvider } from "@/components/indicators/indicator-filters-context";

export default function IndicatorsPage() {
  return (
    <IndicatorFiltersProvider>
      <IndicatorFeaturesProvider>
        <div className="flex w-full flex-col gap-2.5 overflow-y-auto">
          <div className="flex min-h-11 items-center justify-between">
            <h1 className="justify-start text-xl leading-4 font-semibold text-zinc-800">Ցուցաւնիշ</h1>
          </div>
          <Filters />
          <IndicatorsForm />
        </div>
      </IndicatorFeaturesProvider>
    </IndicatorFiltersProvider>
  );
}
