"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { buildStatSearchEntryHref } from "@/lib/stat-menu-utils";

export default function HeaderSearchButton({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const href = useMemo(
    () => buildStatSearchEntryHref(pathname, searchParams.toString()),
    [pathname, searchParams]
  );

  return (
    <Link
      href={href}
      className={`flex cursor-pointer items-center outline-none ${className}`}
      aria-label={t("stat.search_action", "Որոնել")}
    >
      <Image src="/icons/search.svg" alt="" width={24} height={24} aria-hidden />
    </Link>
  );
}
