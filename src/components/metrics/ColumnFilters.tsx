"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { MetricCombination } from "@/types/metric";
import { headerForColumnIndex } from "@/components/metrics/metric-combinations-table-utils";
import { useTranslation } from "@/hooks/useTranslation";
import type { UseColumnFiltersResult } from "./useColumnFilters";

interface ColumnFiltersProps {
  combinations: MetricCombination[];
  filters: UseColumnFiltersResult;
  totalCount: number;
  filteredCount: number;
  className?: string;
}

export function ColumnFilters({
  combinations,
  filters,
  totalCount,
  filteredCount,
  className,
}: ColumnFiltersProps) {
  const { t } = useTranslation();
  const {
    columnIndexes,
    columnValueOptions,
    activeFilterCount,
    isVisible,
    getSelected,
    clearAll,
    toggleColumnVisible,
    toggleColumnValue,
  } = filters;

  if (columnIndexes.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "text-[14px] leading-3.5",
              activeFilterCount === 0 ? "text-[rgba(44,44,44,0.65)]" : "text-[rgba(44,44,44,1)]"
            )}
          >
            {activeFilterCount > 0
              ? `${t("stat.filters", "Ֆիլտրեր")} (${activeFilterCount})`
              : t("stat.filters", "Ֆիլտրեր")}
          </div>
          <button
            type="button"
            className="text-xs font-medium text-[rgba(39,81,153,1)] hover:underline disabled:opacity-50"
            disabled={activeFilterCount === 0}
            onClick={clearAll}
          >
            {t("stat.clear_all", "Մաքրել բոլորը")}
          </button>
        </div>
        <div className="text-[14px] leading-3.5 text-[rgba(44,44,44,0.65)]">
          {filteredCount} / {totalCount}
        </div>
      </div>

      <div className="flex overflow-x-auto bg-[rgba(241,245,248,1)]">
        {columnIndexes.map((i) => {
          const options = columnValueOptions[i] ?? [];
          const selected = getSelected(i);
          const visible = isVisible(i);
          const label = headerForColumnIndex(combinations, i);
          return (
            <div key={i} className="shrink-0 px-4 py-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={visible}
                  onCheckedChange={(checked) => toggleColumnVisible(i, Boolean(checked))}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={!visible}
                      className="flex items-center gap-1 text-sm text-[#2c2c2c] disabled:opacity-40"
                    >
                      <span>{label}</span>
                      <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto max-w-150 min-w-36 p-2" align="start">
                    <div className="flex max-h-100 flex-col gap-0.5 overflow-y-auto">
                      {options.map((opt) => {
                        const isChecked = selected === null || (selected?.has(opt) ?? true);
                        return (
                          <label
                            key={opt}
                            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-[rgba(241,245,248,1)]"
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                toggleColumnValue(i, opt, Boolean(checked))
                              }
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
