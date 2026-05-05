"use client";

import Image from "next/image";
import Link from "next/link";
import { TypographyH1 } from "@/components/ui/typography";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useMemo } from "react";
import useSWR from "swr";
import { fetchSections } from "@/services/sectionsService";
import { swrKeys } from "@/lib/swr/cache-keys";
import { isRootTopic } from "@/lib/section-topic-utils";
import { useLang } from "@/providers/LangProvider";
import { useTranslation } from "@/hooks/useTranslation";
import type { ContentLangCode } from "@/types/content-entries";

const languages: { labelKey: string; code: ContentLangCode; fallback: string }[] = [
  { labelKey: "language.hy", code: "hy", fallback: "Armenian" },
  { labelKey: "language.en", code: "en", fallback: "English" },
  // { labelKey: "language.ru", code: "ru", fallback: "Russian" },
];

const navItems = [
  { key: "navigation.catalog", href: "catalog", fallback: "Catalog" },
  { key: "navigation.news", href: "/news", fallback: "Publications" },
  {
    key: "navigation.information_center",
    href: "/information-center",
    fallback: "Information Center",
  },
  { key: "navigation.feedback", href: "/feedback", fallback: "Feedback" },
];

export default function Header() {
  const { activeLang, setActiveLang } = useLang();
  const { t } = useTranslation();
  const { data: sections = [] } = useSWR(swrKeys.sections, fetchSections);

  const catalogHref = useMemo(() => {
    for (const section of sections) {
      const first = section.topics.find(isRootTopic);
      if (first) return `/stat/${first._id}`;
    }
    return "/stat";
  }, [sections]);

  const items = useMemo(
    () =>
      navItems.map((item) =>
        item.href === "catalog" ? { ...item, href: catalogHref } : item
      ),
    [catalogHref]
  );

  const activeLangLabel = languages.find((l) => l.code === activeLang);

  return (
    <header className="bg-blue1000 flex w-full flex-col items-center">
      <div className="flex w-full max-w-295 items-center justify-between py-4">
        <Link href="/">
          <Image src={"/logo.svg"} alt={"Logo"} width={506} height={58} />
          <TypographyH1 className="hidden">
            {t("header.site_title", "Statistical Committee of the Republic of Armenia ARMSTAT")}
          </TypographyH1>
        </Link>
        {/*<div className="border-blue800 flex rounded-sm border">*/}
        {/*  <input*/}
        {/*    type="text"*/}
        {/*    placeholder={"Search"}*/}
        {/*    className="placeholder:text-blue500/30 px-4 py-2 outline-none"*/}
        {/*  />*/}
        {/*  <button className="border-l-blue800 flex w-13.5 cursor-pointer items-center justify-center border-l">*/}
        {/*    <Image src="/icons/search.svg" alt="Search" width={24} height={24} />*/}
        {/*  </button>*/}
        {/*</div>*/}
      </div>
      <div className="bg-blue800/30 flex w-full justify-center py-4 max-md:hidden">
        <nav className="flex w-full max-w-295 items-center justify-between">
          <ul className="flex gap-6">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{t(item.key, item.fallback)}</Link>
              </li>
            ))}
          </ul>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1 p-[3px] outline-none"
              >
                <Image src="/icons/earth.svg" alt="Earth" width={24} height={24} />
                <span>
                  {activeLangLabel
                    ? t(activeLangLabel.labelKey, activeLangLabel.fallback)
                    : ""}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setActiveLang(lang.code)}
                  className={lang.code === activeLang ? "font-bold" : ""}
                >
                  {t(lang.labelKey, lang.fallback)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
