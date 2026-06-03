"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { MetricCombination } from "@/types/metric";
import {
  headerForColumnIndex,
  maxRowLength,
  valueAtColumnIndex,
} from "@/components/metrics/metric-combinations-table-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { MarkdownText } from "@/components/site/MarkdownText";
import { useTranslation } from "@/hooks/useTranslation";

const PAGE_SIZE = 20;

type SortKey = number | "value";

interface TableTabProps {
  combinations?: MetricCombination[];
  filteredCombinations?: MetricCombination[];
  isLoading?: boolean;
  link?: string;
  updatedAt?: string;
  viewCount?: number;
}

const TableTab = ({
  combinations = [],
  filteredCombinations = [],
  isLoading = false,
  link,
  updatedAt,
  viewCount,
}: TableTabProps) => {
  const { t } = useTranslation();
  const columnCount = useMemo(() => maxRowLength(combinations), [combinations]);
  const columnIndexes = useMemo(
    () => Array.from({ length: columnCount }, (_, i) => i),
    [columnCount]
  );

  const headers = useMemo(
    () => [
      ...columnIndexes.map((i) => ({
        label: headerForColumnIndex(combinations, i),
        key: i as SortKey,
      })),
      { label: t("stat.table.value", "Արժեք"), key: "value" as SortKey },
    ],
    [columnIndexes, combinations, t]
  );

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sortKey, setSortKey] = useState<SortKey>(0);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Reset pagination when filtered data changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filteredCombinations]);

  const sortedData = useMemo(() => {
    return [...filteredCombinations].sort((a, b) => {
      const aVal = sortKey === "value" ? (a.value ?? "") : valueAtColumnIndex(a, sortKey as number);
      const bVal = sortKey === "value" ? (b.value ?? "") : valueAtColumnIndex(b, sortKey as number);
      const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
      return order === "asc" ? cmp : -cmp;
    });
  }, [filteredCombinations, sortKey, order]);

  const visibleData = sortedData.slice(0, visibleCount);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, sortedData.length));
      }
    });
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [sortedData.length]);

  const handleSort = (key: SortKey) => {
    const newOrder = sortKey === key && order === "asc" ? "desc" : "asc";
    setSortKey(key);
    setOrder(newOrder);
    setVisibleCount(PAGE_SIZE);
  };

  const gridCols = `repeat(${headers.length}, minmax(120px, 1fr))`;

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
        <div
          className="sticky top-0 z-10 grid border-b bg-white py-3"
          style={{ gridTemplateColumns: gridCols }}
        >
          {headers.map((h) => (
            <button
              key={String(h.key)}
              onClick={() => handleSort(h.key)}
              className="flex items-center gap-[4px] pr-5 text-left text-[12px] font-semibold text-[rgba(40,40,40,1)]"
            >
              {h.label}
              {sortKey === h.key ? (
                order === "asc" ? (
                  <img src="/arrowTop.svg" alt="sort up" />
                ) : (
                  <img src="/arrowTop.svg" className="rotate-180" alt="sort down" />
                )
              ) : null}
            </button>
          ))}
        </div>

        {visibleData.map((combo, i) => (
          <div key={combo._id} className="grid border-b" style={{ gridTemplateColumns: gridCols }}>
            {columnIndexes.map((ci) => (
              <p key={ci} className="pt-3.75 pr-5 pb-4.5 text-[12px] text-[rgba(40,40,40,1)]">
                {valueAtColumnIndex(combo, ci)}
              </p>
            ))}
            <p className="pt-3.75 pr-5 pb-4.5 text-[12px] text-[rgba(40,40,40,1)]">{combo.value}</p>
          </div>
        ))}

        {visibleCount < sortedData.length && (
          <div
            ref={observerRef}
            className="flex h-10 items-center justify-center text-xs text-gray-400"
          >
            {t("stat.table.loading", "Բեռնվում է…")}
          </div>
        )}
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
            <p className="text-[11px] text-[rgba(110,127,136,1)]">
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
