"use client";

import { useRouter } from "next/navigation";
import { sortIndicatorSearchResults, type IndicatorSearchGroup } from "@/lib/stat-search-utils";
import { cn } from "@/lib/utils";
import StatEmptyPlaceholder from "@/components/site/stat/StatEmptyPlaceholder";

type StatIndicatorListProps = {
  groups: IndicatorSearchGroup[];
  /** Group header ids to hide (e.g. when page title already shows the topic name). */
  hideHeaderForGroupIds?: string[];
};

export default function StatIndicatorList({
  groups,
  hideHeaderForGroupIds = [],
}: StatIndicatorListProps) {
  const router = useRouter();

  if (groups.length === 0) {
    return <StatEmptyPlaceholder />;
  }

  return (
    <div className="mt-11 flex w-full flex-col gap-[25px]">
      {groups
        .filter(
          (group) => !hideHeaderForGroupIds.includes(group.headerId) || group.indicators.length > 0
        )
        .map((group) => {
          const hideHeader = hideHeaderForGroupIds.includes(group.headerId);

          return (
            <div key={group.headerId} className="flex flex-col">
              {!hideHeader ? (
                <div
                  className={cn(
                    "text-textBlack800 border-t border-t-[rgba(15,104,192,1)] bg-[rgba(241,245,248,1)] px-4 py-4 text-sm font-medium"
                  )}
                >
                  {group.header}
                </div>
              ) : null}
              {group.indicators.length > 0 && (
                <div className={cn("flex flex-col divide-y divide-[rgba(0,0,0,0.1)]")}>
                  {sortIndicatorSearchResults(group.indicators).map((indicator) => (
                    <button
                      key={indicator.id}
                      type="button"
                      onClick={() => router.push(`/stat/${indicator.id}`)}
                      className="text-textBlack800 hover:bg-textBlack300/50 flex w-full cursor-pointer items-center px-4 py-2 text-left text-sm outline-hidden"
                    >
                      {indicator.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
