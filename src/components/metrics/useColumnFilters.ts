"use client";

import { useState, useMemo, useEffect } from "react";
import type { MetricCombination, MetricCombinationRowEntry } from "@/types/metric";
import {
  maxRowLength,
  valueAtColumnIndex,
} from "@/components/metrics/metric-combinations-table-utils";

function syncAttributesToRow(
  combo: MetricCombination,
  row: MetricCombinationRowEntry[]
): MetricCombination {
  const attributes: Record<string, string> = {};
  for (const entry of row) {
    if (entry.attributeId) {
      attributes[entry.attributeId] = (combo.attributes ?? {})[entry.attributeId] ?? "";
    }
  }
  return { ...combo, row, attributes };
}

export interface UseColumnFiltersResult {
  columnVisible: boolean[];
  columnSelectedValues: (Set<string> | null)[];
  columnCount: number;
  columnIndexes: number[];
  columnValueOptions: string[][];
  visibleColumnIndexes: number[];
  valueFilteredCombinations: MetricCombination[];
  projectedCombinations: MetricCombination[];
  activeFilterCount: number;
  isVisible: (i: number) => boolean;
  getSelected: (i: number) => Set<string> | null;
  clearAll: () => void;
  toggleColumnVisible: (i: number, visible: boolean) => void;
  toggleColumnValue: (i: number, opt: string, checked: boolean) => void;
}

export function useColumnFilters(
  combinations: MetricCombination[],
  isCumulative?: boolean,
  resetKey?: string
): UseColumnFiltersResult {
  const [columnVisible, setColumnVisible] = useState<boolean[]>([]);
  const [columnSelectedValues, setColumnSelectedValues] = useState<(Set<string> | null)[]>([]);

  const columnCount = useMemo(() => maxRowLength(combinations), [combinations]);
  const columnIndexes = useMemo(
    () => Array.from({ length: columnCount }, (_, i) => i),
    [columnCount]
  );

  useEffect(() => {
    setColumnVisible([]);
    setColumnSelectedValues([]);
  }, [resetKey]);

  const isVisible = (i: number) => columnVisible[i] !== false;
  const getSelected = (i: number): Set<string> | null => columnSelectedValues[i] ?? null;

  const visibleColumnIndexes = useMemo(
    () => columnIndexes.filter((i) => isVisible(i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnIndexes, columnVisible]
  );

  const columnValueOptions = useMemo(() => {
    if (columnCount === 0) return [];
    return columnIndexes.map((ci) => {
      const uniq = new Set<string>();
      for (const combo of combinations) uniq.add(valueAtColumnIndex(combo, ci));
      return Array.from(uniq).sort((a, b) => a.localeCompare(b));
    });
  }, [columnCount, columnIndexes, combinations]);

  const valueFilteredCombinations = useMemo(() => {
    if (columnCount === 0) return combinations;
    return combinations.filter((combo) =>
      columnIndexes.every((i) => {
        if (!isVisible(i)) return true;
        const selected = getSelected(i);
        if (selected === null) return true;
        if (selected.size === 0) return false;
        return selected.has(valueAtColumnIndex(combo, i));
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnCount, columnIndexes, columnVisible, columnSelectedValues, combinations]);

  const projectedCombinations = useMemo((): MetricCombination[] => {
    if (visibleColumnIndexes.length === columnCount) {
      return valueFilteredCombinations.map((combo) =>
        syncAttributesToRow(combo, combo.row ?? [])
      );
    }

    // Collapse duplicate projections into a single row. isCumulative=true means values are
    // summable counts → add them; otherwise keep the first occurrence.
    const isSummable = isCumulative === true;
    const groupMap = new Map<string, { combo: MetricCombination; numValue: number }>();

    for (const combo of valueFilteredCombinations) {
      const projectedRow = visibleColumnIndexes
        .map((i) => combo.row?.[i])
        .filter((e): e is MetricCombinationRowEntry => Boolean(e));

      const key = visibleColumnIndexes.map((i) => valueAtColumnIndex(combo, i)).join("\0");

      if (groupMap.has(key)) {
        if (isSummable) {
          groupMap.get(key)!.numValue += Number(combo.value) || 0;
        }
      } else {
        groupMap.set(key, {
          combo: syncAttributesToRow(combo, projectedRow),
          numValue: Number(combo.value) || 0,
        });
      }
    }

    return Array.from(groupMap.values()).map(({ combo, numValue }) => ({
      ...combo,
      value: String(numValue),
    }));
  }, [valueFilteredCombinations, visibleColumnIndexes, columnCount, isCumulative]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < columnCount; i++) {
      if (!isVisible(i)) {
        count++;
        continue;
      }
      const selected = getSelected(i);
      if (selected !== null && selected.size < (columnValueOptions[i]?.length ?? 0)) {
        count++;
      }
    }
    return count;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnCount, columnVisible, columnSelectedValues, columnValueOptions]);

  const clearAll = () => {
    setColumnVisible(Array.from({ length: columnCount }, () => true));
    setColumnSelectedValues(Array.from({ length: columnCount }, () => null));
  };

  const toggleColumnVisible = (i: number, visible: boolean) => {
    setColumnVisible((prev) => {
      const copy = Array.from(
        { length: Math.max(prev.length, i + 1) },
        (_, j) => prev[j] !== false
      );
      copy[i] = visible;
      return copy;
    });
  };

  const toggleColumnValue = (i: number, opt: string, checked: boolean) => {
    setColumnSelectedValues((prev) => {
      const copy = Array.from({ length: Math.max(prev.length, i + 1) }, (_, j) => prev[j] ?? null);
      const allOptions = columnValueOptions[i] ?? [];
      const current = copy[i] === null ? new Set(allOptions) : new Set(copy[i] as Set<string>);

      if (checked) current.add(opt);
      else current.delete(opt);

      copy[i] = current.size === allOptions.length ? null : current;
      return copy;
    });
  };

  return {
    columnVisible,
    columnSelectedValues,
    columnCount,
    columnIndexes,
    columnValueOptions,
    visibleColumnIndexes,
    valueFilteredCombinations,
    projectedCombinations,
    activeFilterCount,
    isVisible,
    getSelected,
    clearAll,
    toggleColumnVisible,
    toggleColumnValue,
  };
}
