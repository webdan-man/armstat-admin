"use client";

import Image from "next/image";
import Link from "next/link";
import { MarkdownText } from "@/components/site/MarkdownText";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { useLang } from "@/providers/LangProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { useSiteNavItems } from "@/hooks/useSiteNavItems";
import HeaderSearchButton from "@/components/site/HeaderSearchButton";
import type { ContentLangCode } from "@/types/content-entries";
import { swrKeys } from "@/lib/swr/cache-keys";
import { fetchHomePage } from "@/services/mainPageService";

const languages: { labelKey: string; code: ContentLangCode; fallback: string }[] = [
  { labelKey: "language.hy", code: "hy", fallback: "Armenian" },
  { labelKey: "language.en", code: "en", fallback: "English" },
  { labelKey: "language.ru", code: "ru", fallback: "Russian" },
];

function LanguageDropdown({
  activeLang,
  setActiveLang,
  visibleLanguages,
  ready,
}: {
  activeLang: ContentLangCode;
  setActiveLang: (code: ContentLangCode) => void;
  visibleLanguages: typeof languages;
  ready: boolean;
}) {
  const { t } = useTranslation();
  const activeLangLabel = languages.find((l) => l.code === activeLang);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-hidden={!ready}
          className={`flex cursor-pointer items-center gap-1 p-[3px] text-white outline-none ${
            ready ? "" : "pointer-events-none invisible"
          }`}
        >
          <Image src="/icons/earth.svg" alt="Earth" width={24} height={24} />
          <span className="max-md:hidden">
            {activeLangLabel ? t(activeLangLabel.labelKey, activeLangLabel.fallback) : ""}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {visibleLanguages.map((lang) => (
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
  );
}

export default function Header() {
  const { activeLang, setActiveLang, ready } = useLang();
  const { t } = useTranslation();
  const items = useSiteNavItems();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: homePageData } = useSWR(swrKeys.homePage, fetchHomePage);
  const visibleLanguages = homePageData?.activeLocales
    ? languages.filter((l) => homePageData.activeLocales!.includes(l.code))
    : languages;

  useEffect(() => {
    if (!homePageData?.activeLocales || visibleLanguages.length === 0) return;
    if (!visibleLanguages.find((l) => l.code === activeLang)) {
      setActiveLang(visibleLanguages[0].code);
    }
  }, [homePageData, activeLang, visibleLanguages, setActiveLang]);

  const pathname = usePathname();

  return (
    <header className="bg-blue1000 relative flex w-full flex-col items-center">
      <div className="flex w-full max-w-400 items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-4 max-md:gap-2">
          <Image
            className="max-md:w-[25%]"
            src={"/logo.svg"}
            alt={"Logo"}
            width={190}
            height={58}
          />
          <MarkdownText
            className="text-fontSizeM leading-fontLine-heightMD shrink-0 font-semibold max-md:text-[12px] max-md:leading-[14px]"
            as="h1"
          >
            {t("header.site_title", "Statistical Committee of the Republic of Armenia ARMSTAT")}
          </MarkdownText>
        </Link>
        <div className="flex shrink-0 items-center gap-3">
          {ready ? (
            <LanguageDropdown
              activeLang={activeLang}
              setActiveLang={setActiveLang}
              visibleLanguages={visibleLanguages}
              ready={ready}
            />
          ) : null}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="hidden h-8 w-8 flex-col items-center justify-center gap-[5px] focus:outline-none max-md:flex"
            aria-label="Toggle menu"
          >
            <span
              className={`h-[2px] w-6 rounded-full bg-white transition-all duration-300 ${
                mobileOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[2px] w-6 rounded-full bg-white transition-all duration-300 ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-[2px] w-6 rounded-full bg-white transition-all duration-300 ${
                mobileOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Desktop nav */}
      <div className="bg-blue800/30 flex w-full justify-center py-4 max-md:hidden">
        <nav className="flex w-full max-w-400 items-center justify-between px-5">
          <ul className="flex gap-6">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "font-bold"
                      : ""
                  }
                >
                  {t(item.key, item.fallback)}
                </Link>
              </li>
            ))}
          </ul>
          <HeaderSearchButton />
        </nav>
      </div>

      {/* Mobile menu */}
      <div
        className={`bg-blue800/95 absolute top-full left-0 z-50 hidden w-full flex-col px-6 py-8 shadow-lg transition-all duration-300 max-md:flex ${
          mobileOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-6">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`text-lg text-white hover:underline ${
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "font-bold"
                    : "font-semibold"
                }`}
              >
                {t(item.key, item.fallback)}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 border-t border-white/20 pt-6">
          <HeaderSearchButton className="text-white" />
        </div>
      </div>
    </header>
  );
}
