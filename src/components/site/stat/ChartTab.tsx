"use client";

import React, { useEffect } from "react";
import Chart from "@/components/metrics/charts/Chart";
import type { MetricCombination } from "@/types/metric";
import { Skeleton } from "@/components/ui/skeleton";
import { MarkdownText } from "@/components/site/MarkdownText";
import { recordMetricView } from "@/services/metricsService";
import { useTranslation } from "@/hooks/useTranslation";
import { useFormattedDisplayDate } from "@/hooks/useFormatDisplayDate";

interface ChartTabProps {
  combinations?: MetricCombination[];
  isCumulative?: boolean;
  isLoading?: boolean;
  link?: string;
  metricId?: string;
  updatedAt?: string;
  viewCount?: number;
}

export default function ChartTab({
  combinations = [],
  isCumulative = false,
  isLoading = false,
  link,
  metricId,
  viewCount,
  updatedAt,
}: ChartTabProps) {
  const { t } = useTranslation();
  const formattedUpdatedAt = useFormattedDisplayDate(updatedAt);
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
          <Chart combinations={combinations} isCumulative={isCumulative} />
        </>
      )}
      {combinations?.length > 0 && (
        <div className="flex justify-between gap-5">
          <div className="flex gap-5">
            {formattedUpdatedAt ? (
              <p className="text-[11px] text-[rgba(110,127,136,1)]">
                {t("stat.updated_at", "Թարմացված է՝")} {formattedUpdatedAt}
              </p>
            ) : null}
            {link && (
              <p className="flex gap-1 text-[11px] text-[rgba(110,127,136,1)]">
                {t("stat.source", "Աղբյուրը՝")} <MarkdownText as={"span"}>{link}</MarkdownText>
              </p>
            )}
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
