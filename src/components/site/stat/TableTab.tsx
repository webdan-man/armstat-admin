"use client";

import React from "react";
import type { MetricCombination } from "@/types/metric";
import { Skeleton } from "@/components/ui/skeleton";
import { MarkdownText } from "@/components/site/MarkdownText";
import { useTranslation } from "@/hooks/useTranslation";
import CombinationsTable from "@/components/metrics/CombinationsTable";

interface TableTabProps {
  combinations?: MetricCombination[];
  isLoading?: boolean;
  link?: string;
  metricUnit?: string;
  updatedAt?: string;
  viewCount?: number;
}

const TableTab = ({
  combinations = [],
  isLoading = false,
  link,
  updatedAt,
  viewCount,
  metricUnit,
}: TableTabProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  if (!combinations.length) {
    return (
      <p className="text-[14px] text-[rgba(44,44,44,0.65)]">
        {t("stat.table.no_data", "Տվյալներ չկան")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="relative h-200 w-full overflow-y-auto">
        <CombinationsTable combinations={combinations} metricUnit={metricUnit} />
      </div>

      <div className="flex justify-between gap-5">
        <div className="flex gap-5">
          {updatedAt ? (
            <p className="text-[11px] text-[rgba(110,127,136,1)]">
              {t("stat.updated_at", "Թարմացված է՝")}{" "}
              {new Date(updatedAt).toLocaleString("hy-AM", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
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
    </div>
  );
};

export default TableTab;
