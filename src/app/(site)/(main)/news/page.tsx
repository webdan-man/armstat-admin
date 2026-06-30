"use client";

import { useEffect, useState } from "react";
import { TypographyH2 } from "@/components/ui/typography";
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

const FETCH_LIMIT = 50;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";

function absolutizeUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function fetchAllNews(): Promise<NewsItem[] | null> {
  try {
    const all: NewsItem[] = [];
    let page = 1;
    let total = 0;

    while (true) {
      const res = await fetch(`/api/news?limit=${FETCH_LIMIT}&page=${page}`);
      if (!res.ok) return all.length > 0 ? sortNewsByLatestDate(all) : null;

      const json = (await res.json()) as { data: NewsItem[]; total: number };
      total = json.total;
      if (!json.data.length) break;

      all.push(...json.data);
      if (all.length >= total) break;
      page += 1;
    }

    return sortNewsByLatestDate(all);
  } catch {
    return null;
  }
}

export default function NewsPage() {
  const { t, activeLang } = useTranslation();
  const { formatDisplayDate } = useFormatDisplayDate();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchAllNews().then((data) => {
      if (data) {
        setItems(data);
      } else {
        setError(true);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex w-full max-w-305 flex-col px-5 pt-12 pb-40">
      <TypographyH2 className="text-textBlack800">{t("news.title", "Նորություններ")}</TypographyH2>

      {loading ? (
        <div className="mt-11 flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : error ? (
        <p className="text-textBlack600 mt-11 text-center">
          {t("news.load_error", "Չհաջողվեց բեռնել նորությունները։")}
        </p>
      ) : (
        <>
          <div className="mt-11.25 grid grid-cols-3 gap-10 max-md:flex max-md:flex-col">
            {items.map((item) => {
              const title = resolveLocalizedNewsText(item.title, activeLang);
              const content = resolveLocalizedNewsText(item.content, activeLang);
              return (
              <div
                key={item._id}
                className="border-textBlack300 flex flex-col rounded-sm border shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)]"
              >
                <div className="flex flex-col items-start gap-2 px-6 pt-6 pb-4">
                  <p className="text-textBlack600 leading-[24px] tracking-normal">
                    {formatDisplayDate(getNewsDisplayDate(item))}
                  </p>
                  <p className="text-fontSizeL text-textBlack800 leading-[24px] font-semibold tracking-normal">
                    {title}
                  </p>
                </div>
                <div className="relative h-59.75 w-full overflow-hidden">
                  <Image
                    src={absolutizeUrl(item.image) ?? "/news/content.jpg"}
                    alt={title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-4 px-6 pt-4 pb-6">
                  <p className="text-textBlack700 leading-[24px] tracking-normal">
                    {truncateNewsPreview(content)}
                  </p>
                  <Link
                    href={`/news/${item._id}`}
                    className="bg-link border-blue600 mt-auto w-full rounded-sm border-2 p-2 text-center"
                  >
                    {t("news.read_more", "Կարդալ ավելին")}
                  </Link>
                </div>
              </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
