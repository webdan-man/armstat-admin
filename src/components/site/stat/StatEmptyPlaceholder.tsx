"use client";

import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";

export default function StatEmptyPlaceholder() {
  const { t } = useTranslation();

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
