"use client";

import { useMemo } from "react";
import { TypographyH2, TypographyH3, TypographyP } from "@/components/ui/typography";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { useFormatDisplayDate } from "@/hooks/useFormatDisplayDate";
import {
  getNewsDisplayDate,
  resolveLocalizedNewsText,
  sortNewsByLatestDate,
  truncateNewsPreview,
  type MaybeLocalizedNewsText,
} from "@/utils/news.util";

type NewsItem = {
  _id: string;
  title: MaybeLocalizedNewsText;
  content: MaybeLocalizedNewsText;
  image?: string;
  url?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";

function absolutizeUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

function NewsCard({ item }: { item: NewsItem }) {
  const { t, activeLang } = useTranslation();
  const { formatDisplayDate } = useFormatDisplayDate();
  const imageSrc = absolutizeUrl(item.image) ?? "/news/content.jpg";
  const title = resolveLocalizedNewsText(item.title, activeLang);
  const content = resolveLocalizedNewsText(item.content, activeLang);

  return (
    <div className="border-textBlack300 flex w-full flex-col rounded-lg border shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)]">
      <div className="flex w-full flex-col gap-2 px-6 pt-6 pb-4">
        <TypographyP className="text-textBlack600">
          {formatDisplayDate(getNewsDisplayDate(item))}
        </TypographyP>
        <TypographyH3 className="text-textBlack800 tracking-normal">{title}</TypographyH3>
      </div>
      <div className="relative h-59.75 w-full overflow-hidden">
        <Image src={imageSrc} alt="News" fill unoptimized className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-4 px-6 pt-6 pb-4">
        <TypographyP className="text-textBlack700 tracking-normal">
          {truncateNewsPreview(content)}
        </TypographyP>
        <Link
          href={`/news/${item._id}`}
          className="bg-link border-blue600 mt-auto w-full rounded-sm border-2 p-2 text-center"
        >
          {t("news.read_more", "Կարդալ ավելին")}
        </Link>
      </div>
    </div>
  );
}

export default function News({ items }: { items: NewsItem[] }) {
  const { t } = useTranslation();

  const sortedItems = useMemo(() => sortNewsByLatestDate(items), [items]);

  if (sortedItems.length === 0) {
    return null;
  }

  return (
    <section className="flex w-full flex-col items-center">
      <div className="flex w-full max-w-305 flex-col items-start px-5 py-15">
        <TypographyH2 className="max-w-180 text-center font-medium text-[rgba(44,44,44,1)]">
          {t("news.title", "Նորություններ")}
        </TypographyH2>
        <div className="mt-15 grid w-full grid-cols-3 gap-10 max-lg:flex max-lg:flex-col">
          {sortedItems.map((item) => (
            <NewsCard key={item._id} item={item} />
          ))}
        </div>

        <Link
          href="/news"
          className="bg-link border-blue600 mt-10 self-start rounded-sm border-2 px-10 py-2 font-medium"
        >
          {t("news.see_more", "Տեսնել բոլորը")}
        </Link>
      </div>
    </section>
  );
}
