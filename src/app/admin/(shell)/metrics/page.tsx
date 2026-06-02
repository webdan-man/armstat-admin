import React from "react";
import { IndicatorFeaturesProvider } from "@/components/indicators/indicator-features-context";
import { IndicatorFiltersProvider } from "@/components/indicators/indicator-filters-context";
import { requirePermission } from "@/lib/require-permission";
import IndicatorsContent from "@/app/admin/(shell)/metrics/page-content";

export default async function IndicatorsPage() {
  await requirePermission("metrics");

  return (
    <IndicatorFiltersProvider>
      <IndicatorFeaturesProvider>
        <IndicatorsContent />
      </IndicatorFeaturesProvider>
    </IndicatorFiltersProvider>
  );
}
