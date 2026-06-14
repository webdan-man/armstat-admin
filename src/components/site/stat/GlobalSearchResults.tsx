"use client";

import { useRouter } from "next/navigation";
import type { IndicatorSearchGroup } from "@/lib/stat-search-utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

type GlobalSearchResultsProps = {
  groups: IndicatorSearchGroup[];
  onNavigate: () => void;
};

export default function GlobalSearchResults({ groups, onNavigate }: GlobalSearchResultsProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const navigateTo = (id: string) => {
    onNavigate();
    router.push(`/stat/${id}`);
  };

  if (groups.length === 0) {
    return (
      <p className="text-textBlack600 text-fontSizeS py-8 text-center font-medium">
        {t("stat.search_results_placeholder", "Որոնման արդյունքները կտեսնեք այստեղ")}
      </p>
    );
  }

  return (
    <div className="mt-11 flex w-full flex-col gap-8">
      {groups.map((group) => (
        <div key={group.headerId} className="flex flex-col">
          <div
            className={cn(
              "text-textBlack800 border-t border-t-[rgba(15,104,192,1)] bg-[rgba(241,245,248,1)] px-4 py-4 text-sm font-medium"
            )}
          >
            {group.header}
          </div>
          <div className="flex flex-col gap-[12px] pt-[11px]">
            {group.indicators.map((indicator) => (
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
