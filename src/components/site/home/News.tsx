"use client";

import { useState } from "react";
import { TypographyH2, TypographyH3, TypographyP } from "@/components/ui/typography";
import Image from "next/image";
import Link from "next/link";

type NewsItem = {
  _id: string;
  title: string;
  content: string;
  image?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
};

const LIMIT = 3;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";

function absolutizeUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

function formatDate(input?: string): string {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString("hy-AM");
}

async function fetchNewsPage(
  page: number
): Promise<{ data: NewsItem[]; total: number } | null> {
  try {
    const res = await fetch(`/api/news?limit=${LIMIT}&page=${page}`);
    if (!res.ok) return null;
    return (await res.json()) as { data: NewsItem[]; total: number };
  } catch {
    return null;
  }
}

function NewsCard({ item }: { item: NewsItem }) {
  const imageSrc = absolutizeUrl(item.image) ?? "/news/content.jpg";
  const href =
    item.url && item.url.length > 0 ? item.url : `/news/${item._id}`;

  return (
    <div className="flex w-full flex-col rounded-lg border border-textBlack300 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)]">
      <div className="w-full px-6 pt-6 pb-4 flex flex-col gap-2">
        <TypographyP className="text-textBlack600">
          {formatDate(item.updatedAt ?? item.createdAt)}
        </TypographyP>
        <TypographyH3 className="text-textBlack800 tracking-normal">
          {item.title}
        </TypographyH3>
      </div>
      <div className="relative w-full h-59.75">
        <Image src={imageSrc} alt="News" fill unoptimized />
      </div>
      <div className="flex flex-1 flex-col gap-4 px-6 pt-6 pb-4">
        <TypographyP className="text-textBlack700 tracking-normal line-clamp-2">
          {item.content}
        </TypographyP>
        <Link
          href={href}
          className="text-center w-full rounded-sm border-2 bg-link border-blue600 p-2"
        >
          Կարդալ ավելին
        </Link>
      </div>
    </div>
  );
}

export default function News({ items }: { items: NewsItem[] }) {
  const [extraItems, setExtraItems] = useState<NewsItem[]>([]);
  const [nextPage, setNextPage] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const shownIds = new Set([...items, ...extraItems].map((i) => i._id));
  const allItems = [...items, ...extraItems];

  // Show "More" until we've confirmed there are no further items
  const hasMore =
    total === null ? items.length > 0 : allItems.length < total;

  const handleMore = async () => {
    if (loading) return;
    setLoading(true);
    const data = await fetchNewsPage(nextPage);
    if (data) {
      const newItems = data.data.filter((item) => !shownIds.has(item._id));
      setExtraItems((prev) => [...prev, ...newItems]);
      setTotal(data.total);
      setNextPage((p) => p + 1);
    }
    setLoading(false);
  };

  return (
    <section className="flex w-full flex-col items-center">
      <div className="w-full max-w-295 flex py-15 items-start flex-col">
        <TypographyH2 className="text-[rgba(44,44,44,1)] font-medium max-w-180 text-center">
          Նորություններ
        </TypographyH2>
        <div className="mt-15 gap-10 grid grid-cols-3 max-md:flex max-md:flex-col">
          {allItems.map((item) => (
            <NewsCard key={item._id} item={item} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-10 flex w-full justify-center">
            <button
              onClick={handleMore}
              disabled={loading}
              className="bg-link border-blue600 rounded-sm border-2 px-10 py-2 font-medium disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Բեռնում...
                </span>
              ) : (
                "Ավելին"
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
