'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { MetricCombination } from '@/types/metric';
import {
  headerForColumnIndex,
  maxRowLength,
  valueAtColumnIndex,
} from '@/components/indicators/metric-combinations-table-utils';
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_SIZE = 20;

type SortKey = number | 'value';

interface TableTabProps {
  combinations?: MetricCombination[];
  filteredCombinations?: MetricCombination[];
  metricUnit?: string;
  isLoading?: boolean;
}

const TableTab = ({
  combinations = [],
  filteredCombinations = [],
  metricUnit,
  isLoading = false,
}: TableTabProps) => {
  const columnCount = useMemo(() => maxRowLength(combinations), [combinations]);
  const columnIndexes = useMemo(
    () => Array.from({ length: columnCount }, (_, i) => i),
    [columnCount],
  );

  const headers = useMemo(
    () => [
      ...columnIndexes.map((i) => ({
        label: headerForColumnIndex(combinations, i),
        key: i as SortKey,
      })),
      { label: metricUnit ?? 'Արժեք', key: 'value' as SortKey },
    ],
    [columnIndexes, combinations, metricUnit],
  );

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sortKey, setSortKey] = useState<SortKey>(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Reset pagination when filtered data changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filteredCombinations]);

  const sortedData = useMemo(() => {
    return [...filteredCombinations].sort((a, b) => {
      const aVal =
        sortKey === 'value' ? (a.value ?? '') : valueAtColumnIndex(a, sortKey as number);
      const bVal =
        sortKey === 'value' ? (b.value ?? '') : valueAtColumnIndex(b, sortKey as number);
      const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
      return order === 'asc' ? cmp : -cmp;
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
    const newOrder = sortKey === key && order === 'asc' ? 'desc' : 'asc';
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
      <p className="text-[14px] text-[rgba(44,44,44,0.65)]">Տվյալներ չկան</p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="w-full overflow-y-auto h-200 relative">
        <div
          className="grid border-b py-3 sticky top-0 bg-white z-10"
          style={{ gridTemplateColumns: gridCols }}
        >
          {headers.map((h) => (
            <button
              key={String(h.key)}
              onClick={() => handleSort(h.key)}
              className="text-left text-[12px] font-medium pr-5 flex items-center gap-[4px] text-[rgba(40,40,40,1)]"
            >
              {h.label}
              {sortKey === h.key ? (
                order === 'asc' ? (
                  <img src="/arrowTop.svg" alt="sort up" />
                ) : (
                  <img src="/arrowTop.svg" className="rotate-180" alt="sort down" />
                )
              ) : null}
            </button>
          ))}
        </div>

        {visibleData.map((combo, i) => (
          <div
            key={combo._id}
            className="grid border-b"
            style={{ gridTemplateColumns: gridCols }}
          >
            {columnIndexes.map((ci) => (
              <p key={ci} className="text-[12px] pt-3.75 pb-4.5 pr-5 text-[rgba(40,40,40,1)]">
                {valueAtColumnIndex(combo, ci)}
              </p>
            ))}
            <p className="text-[12px] pt-3.75 pb-4.5 pr-5 text-[rgba(40,40,40,1)]">
              {combo.value}
            </p>
          </div>
        ))}

        {visibleCount < sortedData.length && (
          <div
            ref={observerRef}
            className="h-10 flex items-center justify-center text-xs text-gray-400"
          >
            Բեռնվում է…
          </div>
        )}
      </div>

      <div className="flex justify-between gap-5">
        <div className="flex gap-5">
          <p className="text-[rgba(110,127,136,1)] text-[11px]">Թարմացված է՝ 20/05/2024, 16:43</p>
          <p className="text-[rgba(110,127,136,1)] text-[11px]">
            Աղբյուրը՝ <span className="text-[rgba(39,81,153,1)]">Հղման անվանումը կարճ</span>
          </p>
        </div>
        <p className="text-[rgba(110,127,136,1)] text-[11px]">Դիտված է 1,343 անգամ</p>
      </div>
    </div>
  );
};

export default TableTab;
