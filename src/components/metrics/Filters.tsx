"use client";

import React from "react";
import useSWR from "swr";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useMetricFilters } from "@/components/metrics/metric-filters-context";
import { getSectionLocalizedText } from "@/lib/section-localization";
import { formatDisplayDate } from "@/lib/format-display-date";
import { swrKeys } from "@/lib/swr/cache-keys";
import { fetchMetricsByTopicId } from "@/services/metricsService";
import { Button } from "@/components/ui/button";

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
    formMode,
    sections,
    isLoading,
    rootTopics,
    childTopics,
    canSelectMetric,
    resolvedTopicId,
  } = useMetricFilters();
  const controlsDisabled = false;

  const { data: metrics = [], isLoading: isMetricsLoading } = useSWR(
    resolvedTopicId ? swrKeys.metricsByTopic(resolvedTopicId) : null,
    () => fetchMetricsByTopicId(resolvedTopicId!)
  );

  return (
    <>
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Loader2 className="size-4 animate-spin" />
          <span>Բեռնում…</span>
        </div>
      )}
      <div
        className={cn(
          "grid min-h-11 items-end gap-4",
          childTopics.length > 0 ? "md:grid-cols-3" : "md:grid-cols-2"
        )}
      >
        <div className="flex flex-col items-start">
          {selectedFilter.section && <FilterChip>Բաժին</FilterChip>}
          <SearchableSelect
            disabled={isLoading}
            value={selectedFilter.section || undefined}
            onValueChange={(val) =>
              setSelectedFilter({
                section: val,
                subgroup: "",
                subSubgroup: "",
                metric: "",
              })
            }
            placeholder="Բաժին"
            triggerClassName={selectTriggerClass}
            options={sections.map((section) => ({
              value: section._id,
              label: getSectionLocalizedText(section.name),
            }))}
          />
        </div>
        <div className="flex flex-col items-start">
          {selectedFilter.subgroup && <FilterChip>Ենթախումբ</FilterChip>}
          <SearchableSelect
            key={selectedFilter.section || "empty-section"}
            disabled={isLoading || !selectedFilter.section || rootTopics.length === 0}
            value={selectedFilter.subgroup || undefined}
            onValueChange={(val) =>
              setSelectedFilter((prev) => ({
                ...prev,
                subgroup: val,
                subSubgroup: "",
                metric: "",
              }))
            }
            placeholder="Ենթախումբ"
            triggerClassName={selectTriggerClass}
            options={rootTopics.map((topic) => ({
              value: topic._id,
              label: getSectionLocalizedText(topic.title),
            }))}
          />
        </div>

        {!!childTopics.length && (
          <div className="flex w-full items-end justify-between gap-6">
            <div className="flex w-full flex-col items-start">
              <FilterChip>Ենթա-ենթախումբ</FilterChip>
              <SearchableSelect
                key={selectedFilter.subSubgroup || "empty-subgroup"}
                disabled={isLoading || !selectedFilter.subgroup}
                value={selectedFilter.subSubgroup || undefined}
                onValueChange={(val) =>
                  setSelectedFilter((prev) => ({
                    ...prev,
                    subSubgroup: val,
                    metric: "",
                  }))
                }
                placeholder="Ենթա-ենթախումբ"
                triggerClassName={selectTriggerClass}
                options={childTopics.map((topic) => ({
                  value: topic._id,
                  label: getSectionLocalizedText(topic.title),
                }))}
              />
            </div>

            {selectedFilter.subSubgroup && (
              <Button
                className="bg-destructive"
                onClick={() =>
                  setSelectedFilter((prev) => ({ ...prev, subSubgroup: "", metric: "" }))
                }
              >
                X
              </Button>
            )}
          </div>
        )}
      </div>
      <div className={"grid min-h-11 w-full grid-cols-[5fr_1fr] items-center gap-6"}>
        <div className="flex flex-col items-start">
          {Boolean(selectedFilter.metric) && <FilterChip>Ցուցանիշ</FilterChip>}
          <SearchableSelect
            key={`${resolvedTopicId || "empty-topic"}-${formMode}`}
            disabled={controlsDisabled}
            value={selectedFilter.metric || undefined}
            onValueChange={(val) => setSelectedFilter((prev) => ({ ...prev, metric: val }))}
            placeholder="Ցուցանիշ"
            triggerClassName={selectTriggerClass}
            emptyText={isMetricsLoading ? "Բեռնում…" : "Ցուցանիշներ չկան"}
            options={metrics.map((option) => {
              const formatted = option.updatedAt
                ? formatDisplayDate(option.updatedAt) || null
                : null;
              const isPublished = option.publishedAt != null && option.publishedAt !== "";

              return {
                value: option.id,
                label: option.label,
                itemClassName:
                  "flex w-full items-center justify-between rounded-none border-b border-b-[rgba(234,234,234,1)] py-5 *:[span]:last:w-full",
                node: (
                  <>
                    {option.label}{" "}
                    {formatted && (
                      <div className="relative ml-auto justify-start pl-5 text-xs leading-4 font-medium text-zinc-800">
                        <span
                          aria-hidden
                          className={cn(
                            "absolute top-[2px] left-0 h-[7px] w-[7px] rounded-full",
                            isPublished
                              ? "bg-[rgba(37,201,34,1)]"
                              : "bg-[rgba(250,204,21,1)]"
                          )}
                        />
                        {formatted}
                      </div>
                    )}
                  </>
                ),
              };
            })}
          />
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className={`flex cursor-pointer items-center gap-3.25 self-center`}
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
