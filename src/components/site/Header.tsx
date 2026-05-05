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
import { useState, useMemo } from "react";
import useSWR from "swr";
import { fetchSections } from "@/services/sectionsService";
import { swrKeys } from "@/lib/swr/cache-keys";
import { isRootTopic } from "@/lib/section-topic-utils";

const staticItems = [
  { title: "Հրապարակումներ", href: "/news" },
  { title: "Տեղեկատվական կենտրոն", href: "/information-center" },
  { title: "Հետադարձ կապ", href: "/feedback" },
];

const languages = [
  { label: "Հայերեն", code: "hy" },
  { label: "English", code: "en" },
  // { label: 'Русский', code: 'ru' },
];

export default function Header() {
  const [activeLang, setActiveLang] = useState("hy");
  const { data: sections = [] } = useSWR(swrKeys.sections, fetchSections);

  const catalogHref = useMemo(() => {
    for (const section of sections) {
      const first = section.topics.find(isRootTopic);
      if (first) return `/stat/${first._id}`;
    }
    return "/stat";
  }, [sections]);

  const items = useMemo(
    () => [{ title: "Կատալոգ", href: catalogHref }, ...staticItems],
    [catalogHref]
  );

  return (
    <header className="bg-blue1000 flex w-full flex-col items-center">
      <div className="flex w-full max-w-295 items-center justify-between py-4">
        <Link href="/">
          <Image src={"/logo.svg"} alt={"Logo"} width={506} height={58} />
          <TypographyH1 className="hidden">
            Հայաստանի Հանրապետության Վիճակագրական Կոմիտե ԱՐՄՍՏԱՏ
          </TypographyH1>
        </Link>
        {/*<div className="border-blue800 flex rounded-sm border">*/}
        {/*  <input*/}
        {/*    type="text"*/}
        {/*    placeholder={"Որոնել"}*/}
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
            {items.map((item, i) => (
              <li key={item.href}>
                <Link href={item.href}>{item.title}</Link>
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
                <span>{languages.find((l) => l.code === activeLang)?.label}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setActiveLang(lang.code)}
                  className={lang.code === activeLang ? "font-bold" : ""}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
