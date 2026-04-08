"use client";

import React, { useEffect, useRef } from "react";
import useSWR from "swr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useIndicatorFilters } from "@/components/indicators/indicator-filters-context";
import { getSectionLocalizedText } from "@/lib/section-localization";
import { swrKeys } from "@/lib/swr/cache-keys";
import { fetchMetricsByTopicId } from "@/services/metricsService";

const selectTriggerClass = cn(
  "h-9 w-full rounded-[8.5px] border-[#c8c8c8] bg-[#f9fafb] shadow-none"
);

function FilterChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="z-10 -mb-2 ml-3 justify-start bg-[#f9fafb] text-[10px] leading-4 font-normal text-zinc-800">
      {children}
    </span>
  );
}

export default function Filters() {
  const {
    selectedFilter,
    setSelectedFilter,
    openCreateForm,
    sections,
    isLoading,
    rootTopics,
    childTopics,
    canSelectIndicator,
    resolvedTopicId,
  } = useIndicatorFilters();
  const controlsDisabled = isLoading || !canSelectIndicator;

  const { data: indicators = [], isLoading: isIndicatorsLoading } = useSWR(
    resolvedTopicId ? swrKeys.metricsByTopic(resolvedTopicId) : null,
    () => fetchMetricsByTopicId(resolvedTopicId!)
  );
  const previousResolvedTopicId = useRef<string | null>(null);

  useEffect(() => {
    if (previousResolvedTopicId.current === resolvedTopicId) return;
    previousResolvedTopicId.current = resolvedTopicId;
    if (!selectedFilter.indicator) return;
    setSelectedFilter((prev) => ({ ...prev, indicator: "" }));
  }, [resolvedTopicId, selectedFilter.indicator, setSelectedFilter]);

  useEffect(() => {
    if (!selectedFilter.indicator) return;
    const exists = indicators.some((indicator) => indicator.id === selectedFilter.indicator);
    if (exists) return;
    setSelectedFilter((prev) => ({ ...prev, indicator: "" }));
  }, [indicators, selectedFilter.indicator, setSelectedFilter]);

  return (
    <>
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Loader2 className="size-4 animate-spin" />
          <span>Բեռնում…</span>
        </div>
      )}
      <div className="grid min-h-11 items-end gap-4 md:grid-cols-3">
        <div className="flex flex-col items-start">
          {selectedFilter.section && <FilterChip>Բաժին</FilterChip>}
          <Select
            disabled={isLoading}
            value={selectedFilter.section || undefined}
            onValueChange={(val) =>
              setSelectedFilter({
                section: val,
                subgroup: "",
                subSubgroup: "",
                indicator: "",
              })
            }
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="Բաժին" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section._id} value={section._id}>
                  {typeof section.name === "string"
                    ? section.name
                    : getSectionLocalizedText(section.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col items-start">
          {selectedFilter.subgroup && <FilterChip>Ենթախումբ</FilterChip>}
          <Select
            key={selectedFilter.section || "empty-section"}
            disabled={isLoading || !selectedFilter.section || rootTopics.length === 0}
            value={selectedFilter.subgroup || undefined}
            onValueChange={(val) =>
              setSelectedFilter((prev) => ({
                ...prev,
                subgroup: val,
                subSubgroup: "",
                indicator: "",
              }))
            }
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="Ենթախումբ" />
            </SelectTrigger>
            <SelectContent>
              {rootTopics.map((topic) => (
                <SelectItem key={topic._id} value={topic._id}>
                  {topic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col items-start">
          {selectedFilter.subSubgroup && <FilterChip>Ենթա-ենթախումբ</FilterChip>}
          <Select
            key={selectedFilter.subgroup || "empty-subgroup"}
            disabled={isLoading || !selectedFilter.subgroup || childTopics.length === 0}
            value={selectedFilter.subSubgroup || undefined}
            onValueChange={(val) =>
              setSelectedFilter((prev) => ({
                ...prev,
                subSubgroup: val,
                indicator: "",
              }))
            }
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder={"Ենթա-ենթախումբ"} />
            </SelectTrigger>
            <SelectContent>
              {childTopics.map((topic) => (
                <SelectItem key={topic._id} value={topic._id}>
                  {topic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className={"grid min-h-11 w-full grid-cols-[5fr_1fr] items-center gap-6"}>
        <div className="flex flex-col items-start">
          {Boolean(selectedFilter.indicator) && <FilterChip>Ցուցանիշ</FilterChip>}
          <Select
            key={resolvedTopicId || "empty-topic"}
            disabled={controlsDisabled}
            value={selectedFilter.indicator || undefined}
            onValueChange={(val) => setSelectedFilter((prev) => ({ ...prev, indicator: val }))}
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="Ցուցանիշ" />
            </SelectTrigger>
            <SelectContent>
              {indicators.map((option) => {
                let formatted = null;

                if (option.updatedAt) {
                  const date = new Date(option.updatedAt);

                  formatted = `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`;
                }

                return (
                  <SelectItem
                    className={
                      "flex w-full items-center justify-between rounded-none border-b border-b-[rgba(234,234,234,1)] py-5 *:[span]:last:w-full"
                    }
                    key={option.id}
                    value={option.id}
                  >
                    {option.label}{" "}
                    {formatted && (
                      <div className="relative ml-auto justify-start pl-5 text-xs leading-4 font-medium text-zinc-800 before:absolute before:top-[2px] before:left-0 before:h-[7px] before:w-[7px] before:translate-1/2 before:rounded-full before:bg-[rgba(37,201,34,1)]">
                        {formatted}
                      </div>
                    )}
                  </SelectItem>
                );
              })}
              {!isIndicatorsLoading && indicators.length === 0 && (
                <SelectItem value="__empty" disabled>
                  Ցուցանիշներ չկան
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          disabled={controlsDisabled}
          className={`flex cursor-pointer items-center gap-3.25 self-center ${controlsDisabled ? "opacity-50" : ""}`}
        >
          <Image src="/add.svg" width={24} height={24} alt={"add"} />
          <span className="text-[14px] leading-3.5 font-medium text-[rgba(39,81,153,1)]">
            Ստեղծել
          </span>
        </button>
      </div>
    </>
  );
}
