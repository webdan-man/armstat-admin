"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

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

const frameworks = [
  "ՀՀ կացության կարգավիճակ ստացած օտարերկրացիների բաշխումն  ըստ կարգավիճակի տեսակի և տարիքային խմբերի",
  "ՀՀ մշտական կացության կարգավիճակ ստացած օտարերկրացիներ",
  "ՀՀ կացության կարգավիճակ ստացած օտարերկրացիների բաշխումն  ըստ կարգավիճակի տեսակի և տարիքային խմբերի",
  "ՀՀ մշտական կացության կարգավիճակ ստացած օտարերկրացիներ",
  "ՀՀ մշտական կացության կարգավիճակ ստացած օտարերկրացիներ",
  "ՀՀ կացության կարգավիճակ ստացած օտարերկրացիների բաշխումն  ըստ կարգավիճակի տեսակի և տարիքային խմբերի",
  "ՀՀ մշտական կացության կարգավիճակ ստացած օտարերկրացիներ",
  "ՀՀ մշտական կացության կարգավիճակ ստացած օտարերկրացիներ",
];

const options = frameworks.map((label, index) => ({
  label,
  value: index,
  publishedAt: index % 2 ? Date.now() + index : null,
}));

const filtersOptions = {
  section: Array.from({ length: 3 }, (_, i) => ({ label: `Բաժին ${i}`, id: `section${i}` })),
  subgroup: Array.from({ length: 3 }, (_, i) => ({ label: `Ենթախումբ ${i}`, id: `subgroup${i}` })),
  subSubgroup: Array.from({ length: 3 }, (_, i) => ({
    label: `Ենթա-ենթախումբ ${i}`,
    id: `subSubgroup${i}`,
  })),
  indicator: options,
};

export default function Filters() {
  const [selectedFilter, setSelectedFilter] = useState({
    section: "",
    subgroup: "",
    subSubgroup: "",
    indicator: "",
  });

  return (
    <>
      <div className="grid min-h-11 items-end gap-4 md:grid-cols-3">
        <div className="flex flex-col items-start">
          {selectedFilter.section && <FilterChip>Մարզ</FilterChip>}
          <Select onValueChange={(val) => setSelectedFilter((prev) => ({ ...prev, section: val }))}>
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="Բաժին" />
            </SelectTrigger>
            <SelectContent>
              {filtersOptions.section.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col items-start">
          {selectedFilter.subgroup && <FilterChip>Ենթախումբ</FilterChip>}
          <Select
            disabled={!selectedFilter.section}
            onValueChange={(val) => setSelectedFilter((prev) => ({ ...prev, subgroup: val }))}
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="Ենթախումբ" />
            </SelectTrigger>
            <SelectContent>
              {filtersOptions.subgroup.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col items-start">
          {selectedFilter.subSubgroup && <FilterChip>Ենթա-ենթախումբ</FilterChip>}
          <Select
            disabled={!selectedFilter.subgroup}
            onValueChange={(val) => setSelectedFilter((prev) => ({ ...prev, subSubgroup: val }))}
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="Ենթա-ենթախումբ" />
            </SelectTrigger>
            <SelectContent>
              {filtersOptions.subSubgroup.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
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
            disabled={Object.values(selectedFilter).filter(Boolean).length < 3}
            onValueChange={(val) => setSelectedFilter((prev) => ({ ...prev, indicator: val }))}
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="Ցուցանիշ" />
            </SelectTrigger>
            <SelectContent>
              {filtersOptions.indicator.map((option) => {
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
        <Link
          href="/indicators"
          target="_blank"
          className="flex cursor-pointer items-center gap-3.25 self-center"
        >
          <Image src="/add.svg" width="24" height={24} alt={"add"} />
          <span className="text-[14px] leading-3.5 font-medium text-[rgba(39,81,153,1)]">
            Ստեղծել
          </span>
        </Link>
      </div>
    </>
  );
}
