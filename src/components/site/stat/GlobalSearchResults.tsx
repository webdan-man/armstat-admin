"use client";

import { useRouter } from "next/navigation";
import { sortIndicatorSearchResults, type IndicatorSearchGroup } from "@/lib/stat-search-utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import Image from "next/image";
import { buildStatMetricHref } from "@/lib/stat-menu-utils";

type GlobalSearchResultsProps = {
  groups: IndicatorSearchGroup[];
  onNavigate: () => void;
  returnTo?: string;
};

export default function GlobalSearchResults({
  groups,
  onNavigate,
  returnTo,
}: GlobalSearchResultsProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const navigateTo = (id: string) => {
    onNavigate();
    router.push(buildStatMetricHref(id, returnTo));
  };

  if (groups.length === 0) {
    return (
      <div className="mt-11 flex h-[calc(100vh-304px)] w-full flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-1">
          <Image src="/empty.png" alt="empty" width={210} height={112} />
          <p className="text-textBlack600 text-fontSizeS leading-7.25 font-medium">
            {t("stat.search_results_placeholder", "Որոնման արդյունքները կտեսնեք այստեղ")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-11 flex w-full flex-col gap-[25px]">
      {groups.map((group) => (
        <div key={group.headerId} className="flex flex-col">
          <div
            className={cn(
              "text-textBlack800 border-t border-t-[rgba(15,104,192,1)] bg-[rgba(241,245,248,1)] px-4 py-4 text-sm font-medium"
            )}
          >
            {group.header}
          </div>
          <div className="flex flex-col divide-y divide-[rgba(0,0,0,0.1)]">
            {sortIndicatorSearchResults(group.indicators).map((indicator) => (
              <button
                key={indicator.id}
                type="button"
                onClick={() => navigateTo(indicator.id)}
                className="text-textBlack800 hover:bg-textBlack300/50 flex w-full cursor-pointer items-center px-4 py-2 text-left text-sm outline-hidden"
              >
                {indicator.title}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
