"use client";

import React from "react";
import { TypographyH4, TypographyP } from "@/components/ui/typography";
import { StatisticsCarousel } from "@/components/site/home/StatisticsCarousel";
import { useTranslation } from "@/hooks/useTranslation";
import { pickLocale, type Localized } from "@/lib/i18n";

export type FeaturedBlock = {
  title: Localized;
  subtitle: Localized;
  image?: string;
  sections?: Array<{ name: Localized }>;
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
  const { activeLang } = useTranslation();
  return (
    <section className="flex w-full flex-col items-center overflow-hidden pb-15">
      <div className="flex w-full max-w-305 flex-col gap-15.75 px-5">
        {blocks.map((block, idx) => {
          const borderClass = BORDER_COLORS[idx % BORDER_COLORS.length];
          const items = block?.sections?.map((s) => pickLocale(s.name, activeLang) ?? "") ?? [];

          return (
            <StatisticsCarousel key={idx} items={items}>
              <div
                className={`flex border-l-[6px] pt-0.75 pb-1.25 ${borderClass} items-center gap-6 pl-4.5`}
                style={{
                  color: "red",
                }}
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
                      {pickLocale(block.title, activeLang)}
                    </TypographyH4>
                    <TypographyP className="text-textBlack600">
                      {pickLocale(block.subtitle, activeLang)}
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
