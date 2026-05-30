"use client";

import React from "react";
import { TypographyH4, TypographyP } from "@/components/ui/typography";
import { StatisticsCarousel } from "@/components/site/home/StatisticsCarousel";

export type FeaturedBlock = {
  titleKey: string;
  image?: string;
  sections?: Array<{ name: { hy: string; ru?: string; en?: string } }>;
};

export type StatisticsProps = {
  blocks: FeaturedBlock[];
};

const BORDER_COLORS = [
  "border-l-[rgba(204,0,0,1)]",
  "border-l-[rgba(39,81,153,1)]",
  "border-l-warning",
];

export default function Statistics({ blocks }: StatisticsProps) {
  return (
    <section className="flex w-full flex-col items-center overflow-hidden pb-15">
      <div className="flex w-full max-w-305 flex-col gap-15.75 px-5">
        {blocks.map((block, idx) => {
          const borderClass = BORDER_COLORS[idx % BORDER_COLORS.length];
          const items = block?.sections?.map((s) => s.name.hy) ?? [];

          return (
            <StatisticsCarousel key={`${block.titleKey}-${idx}`} items={items}>
              <div
                className={`flex border-l-[6px] pt-0.75 pb-1.25 ${borderClass} items-center gap-6 pl-4.5`}
              >
                <img
                  src={block.image ?? "/statistics/statistics.svg"}
                  alt="statistics"
                  width={46}
                  height={46}
                />
                <div className="flex gap-6">
                  <div className="flex flex-col gap-2">
                    <TypographyH4 className="text-[rgba(44,44,44,1)]">
                      {block.titleKey}
                    </TypographyH4>
                    <TypographyP className="text-textBlack600">
                      Կարճ հուշում պարունակութոյան մասին
                    </TypographyP>
                  </div>
                </div>
              </div>
            </StatisticsCarousel>
          );
        })}
      </div>
    </section>
  );
}
