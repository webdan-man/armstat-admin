"use client";

import React from "react";
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

/** Placeholder labels until indicators are loaded from the API. */
const INDICATOR_PLACEHOLDER_OPTIONS = [
  {
    label:
      "ՀՀ կացության կարգավիճակ ստացած օտարերկրացիների բաշխումն ըստ կարգավիճակի տեսակի և տարիքային խմբերի",
    value: 0,
    publishedAt: null as number | null,
  },
  {
    label: "ՀՀ մշտական կացության կարգավիճակ ստացած օտարերկրացիներ",
    value: 1,
    publishedAt: Date.now() + 1,
  },
  {
    label:
      "ՀՀ կացության կարգավիճակ ստացած օտարերկրացիների բաշխումն ըստ կարգավիճակի տեսակի և տարիքային խմբերի",
    value: 2,
    publishedAt: null,
  },
  {
    label: "ՀՀ մշտական կացության կարգավիճակ ստացած օտարերկրացիներ",
    value: 3,
    publishedAt: Date.now() + 3,
  },
];

export default function Filters() {
  const {
    selectedFilter,
    setSelectedFilter,
    sections,
    isLoading,
    rootTopics,
    childTopics,
    hierarchyComplete,
  } = useIndicatorFilters();

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
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col items-start">
          {selectedFilter.subgroup && <FilterChip>Ենթախումբ</FilterChip>}
          <Select
            disabled={isLoading || !selectedFilter.section}
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
              <SelectValue placeholder={childTopics.length === 0 ? "—" : "Ենթա-ենթախումբ"} />
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
      <div className={"grid min-h-11 w-full grid-cols-[5fr_1fr] items-end gap-6"}>
        <div className="flex w-full flex-col items-start">
          {Boolean(selectedFilter.indicator) && <FilterChip>Ցուցանիշ</FilterChip>}
          <Select
            disabled={isLoading || !hierarchyComplete}
            value={selectedFilter.indicator || undefined}
            onValueChange={(val) => setSelectedFilter((prev) => ({ ...prev, indicator: val }))}
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="Ցուցանիշ" />
            </SelectTrigger>
            <SelectContent>
              {INDICATOR_PLACEHOLDER_OPTIONS.map((option) => {
                let formatted = null;

                if (option.publishedAt) {
                  const date = new Date(option.publishedAt);

                  formatted = `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`;
                }

                return (
                  <SelectItem
                    className={
                      "*:data-[slot=select-value]: flex w-full items-center justify-between rounded-none border-b border-b-[rgba(234,234,234,1)] py-5 *:[span]:last:w-full"
                    }
                    key={option.value}
                    value={String(option.value)}
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
            </SelectContent>
          </Select>
        </div>
        <a
          href="#indicator-form"
          className="flex cursor-pointer items-center gap-3.25 self-center"
        >
          <Image src="/add.svg" width={24} height={24} alt={"add"} />
          <span className="text-[14px] leading-3.5 font-medium text-[rgba(39,81,153,1)]">
            Ստեղծել
          </span>
        </a>
      </div>
    </>
  );
}
