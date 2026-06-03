import React from "react";
import { MetricFeaturesProvider } from "@/components/metrics/metric-features-context";
import { MetricFiltersProvider } from "@/components/metrics/metric-filters-context";
import { requirePermission } from "@/lib/require-permission";
import MetricsContent from "@/app/admin/(shell)/metrics/page-content";

export default async function MetricsPage() {
  await requirePermission("metric");

  return (
    <MetricFiltersProvider>
      <MetricFeaturesProvider>
        <MetricsContent />
      </MetricFeaturesProvider>
    </MetricFiltersProvider>
  );
}
