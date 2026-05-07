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
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const catalogHref = useMemo(() => {
    for (const section of sections) {
      const first = section.topics.find(isRootTopic);
      if (first) return `/stat/${first._id}`;
    }
    return "/stat";
  }, [sections]);

  const items = useMemo(
    () => navItems.map((item) => (item.href === "catalog" ? { ...item, href: catalogHref } : item)),
    [catalogHref]
  );

  const pathname = usePathname();
  const activeLangLabel = languages.find((l) => l.code === activeLang);

  return (
    <header className="bg-blue1000 relative flex w-full flex-col items-center">
      <div className="flex w-full max-w-305 items-center justify-between px-5 py-4 max-md:gap-5">
        <Link href="/">
          <Image src={"/logo.svg"} alt={"Logo"} width={506} height={58} />
          <TypographyH1 className="hidden">
            {t("header.site_title", "Statistical Committee of the Republic of Armenia ARMSTAT")}
          </TypographyH1>
        </Link>
        {/* Mobile hamburger */}
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

      {/* Desktop nav */}
      <div className="bg-blue800/30 flex w-full justify-center py-4 max-md:hidden">
        <nav className="flex w-full max-w-305 items-center justify-between px-5">
          <ul className="flex gap-6">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={pathname === item.href || pathname.startsWith(item.href + "/") ? "font-bold" : ""}
                >
                  {t(item.key, item.fallback)}
                </Link>
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
                  {activeLangLabel ? t(activeLangLabel.labelKey, activeLangLabel.fallback) : ""}
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
          <ul className="flex flex-col gap-4">
            {languages.map((lang) => (
              <li key={lang.code}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveLang(lang.code);
                    setMobileOpen(false);
                  }}
                  className={`flex items-center gap-2 text-base text-white hover:underline ${
                    lang.code === activeLang ? "font-bold" : "font-normal"
                  }`}
                >
                  <Image src="/icons/earth.svg" alt="Earth" width={18} height={18} />
                  {t(lang.labelKey, lang.fallback)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
