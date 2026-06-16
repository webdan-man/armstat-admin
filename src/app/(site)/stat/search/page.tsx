"use client";

import { useMemo, useState, useEffect, type FormEvent, type KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import useSWR from "swr";
import { TypographyH3 } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import GlobalSearchResults from "@/components/site/stat/GlobalSearchResults";
import { useTranslation } from "@/hooks/useTranslation";
import { useLang } from "@/providers/LangProvider";
import { buildStatMenu } from "@/lib/stat-menu-utils";
import { useGlobalIndicatorSearchGroups } from "@/hooks/useGlobalIndicatorSearchGroups";
import { fetchSections } from "@/services/sectionsService";
import { swrKeys } from "@/lib/swr/cache-keys";

export default function StatSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") ?? "";
  const { activeLang } = useLang();
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState(queryFromUrl);

  useEffect(() => {
    setInputValue(queryFromUrl);
  }, [queryFromUrl]);

  const { data: sections } = useSWR(swrKeys.sections, fetchSections);
  const menu = useMemo(() => buildStatMenu(sections ?? [], activeLang), [sections, activeLang]);

  const normalizedQuery = queryFromUrl.trim().toLowerCase();
  const globalSearchGroups = useGlobalIndicatorSearchGroups(menu, normalizedQuery, true);
  const hasQuery = normalizedQuery.length > 0;

  const submitSearch = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    router.push(`/stat/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitSearch();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitSearch();
    }
  };

  return (
    <div className="flex w-full flex-col pt-7.5 pb-10 pl-16.75">
      <form onSubmit={handleSubmit} className="mt-5 w-full">
        <Input
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("stat.search_placeholder", "Որոնել")}
          className="border-textBlack300 h-10.5 w-full text-[rgba(55,71,79,1)] shadow-none"
        />
      </form>
      {hasQuery ? (
        <GlobalSearchResults groups={globalSearchGroups} onNavigate={() => {}} />
      ) : (
        <div className="mt-11 flex h-[calc(100vh-304px)] w-full flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-1">
            <Image src="/empty.png" alt="empty" width={210} height={112} />
            <p className="text-textBlack600 text-fontSizeS leading-7.25 font-medium">
              {t("stat.search_results_placeholder", "Որոնման արդյունքները կտեսնեք այստեղ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
