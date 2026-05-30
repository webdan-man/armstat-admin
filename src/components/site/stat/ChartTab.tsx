"use client";

import { useEffect } from "react";
import Chart from "@/components/indicators/charts/Chart";
import type { MetricCombination } from "@/types/metric";
import { Skeleton } from "@/components/ui/skeleton";
import { MarkdownText } from "@/components/site/MarkdownText";
import { recordMetricView } from "@/services/metricsService";

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
        <Chart combinations={combinations} />
      )}
      {combinations?.length > 0 && (
        <div className="flex justify-between gap-5">
          <div className="flex gap-5">
            <p className="text-[11px] text-[rgba(110,127,136,1)]">Թարմացված է՝ 20/05/2024, 16:43</p>
            <p className="text-[11px] text-[rgba(110,127,136,1)]">
              Աղբյուրը՝ <MarkdownText as={"span"}>{link}</MarkdownText>
            </p>
          </div>
          {viewCount != null && (
            <p className="text-[11px] text-[rgba(110,127,136,1)]">
              Դիտված է {viewCount.toLocaleString()} անգամ
            </p>
          )}
        </div>
      )}
    </div>
  );
}
