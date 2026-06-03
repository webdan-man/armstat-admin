"use client";

import { useEffect } from "react";
import Chart from "@/components/metrics/charts/Chart";
import type { MetricCombination } from "@/types/metric";
import { Skeleton } from "@/components/ui/skeleton";
import { MarkdownText } from "@/components/site/MarkdownText";
import { recordMetricView } from "@/services/metricsService";
import { useTranslation } from "@/hooks/useTranslation";

interface ChartTabProps {
  combinations?: MetricCombination[];
  isLoading?: boolean;
  link?: string;
  metricId?: string;
  viewCount?: number;
}

export default function ChartTab({
  combinations = [],
  isLoading = false,
  link,
  metricId,
  viewCount,
}: ChartTabProps) {
  const { t } = useTranslation();
  useEffect(() => {
    if (metricId) {
      recordMetricView(metricId).catch(() => {});
    }
  }, [metricId]);

  return (
    <div className="flex w-full flex-col gap-4">
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-64 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      ) : (
        <>
          <Chart combinations={combinations} />
        </>
      )}
      {combinations?.length > 0 && (
        <div className="flex justify-between gap-5">
          <div className="flex gap-5">
            <p className="text-[11px] text-[rgba(110,127,136,1)]">
              {t("stat.updated_at", "Թարմացված է՝")} 20/05/2024, 16:43
            </p>
            <p className="text-[11px] text-[rgba(110,127,136,1)]">
              {t("stat.source", "Աղբյուրը՝")} <MarkdownText as={"span"}>{link}</MarkdownText>
            </p>
          </div>
          {viewCount != null && (
            <p className="text-[11px] text-[rgba(110,127,136,1)]">
              {t("stat.viewed_prefix", "Դիտված է")} {viewCount.toLocaleString()}{" "}
              {t("stat.viewed_suffix", "անգամ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
