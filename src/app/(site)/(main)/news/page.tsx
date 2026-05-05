"use client";

import { useEffect, useState } from "react";
import { TypographyH2 } from "@/components/ui/typography";
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

async function fetchNewsPage(page: number): Promise<{ data: NewsItem[]; total: number } | null> {
  try {
    const res = await fetch(`/api/news?limit=${LIMIT}&page=${page}`);

    if (!res.ok) return null;
    return (await res.json()) as { data: NewsItem[]; total: number };
  } catch {
    return null;
  }
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchNewsPage(1).then((data) => {
      if (data) {
        setItems(data.data);
        setTotal(data.total);
      } else {
        setError(true);
      }
      setLoading(false);
    });
  }, []);

  const handleMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const data = await fetchNewsPage(nextPage);
    if (data) {
      setItems((prev) => [...prev, ...data.data]);
      setTotal(data.total);
      setPage(nextPage);
    }
    setLoadingMore(false);
  };

  const hasMore = items.length < total;

  return (
    <div className="flex w-full max-w-295 flex-col pt-12 pb-40">
      <TypographyH2 className="text-textBlack800">Նորություններ</TypographyH2>

      {loading ? (
        <div className="mt-11 flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : error ? (
        <p className="text-textBlack600 mt-11 text-center">Չհաջողվեց բեռնել նորությունները։</p>
      ) : (
        <>
          <div className="mt-11.25 grid grid-cols-3 gap-10 max-md:flex max-md:flex-col">
            {items.map((item) => (
              <div
                key={item._id}
                className="border-textBlack300 flex flex-col rounded-sm border shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)]"
              >
                <div className="flex flex-col items-start gap-2 px-6 pt-6 pb-4">
                  <p className="text-textBlack600 leading-[24px] tracking-normal">
                    {formatDate(item.updatedAt ?? item.createdAt)}
                  </p>
                  <p className="text-fontSizeL text-textBlack800 leading-[24px] font-semibold tracking-normal">
                    {item.title}
                  </p>
                </div>
                <div className="relative h-59.75 w-full">
                  <Image
                    src={absolutizeUrl(item.image) ?? "/news/content.jpg"}
                    alt={item.title}
                    fill
                    unoptimized
                  />
                </div>
                <div className="flex flex-1 flex-col gap-4 px-6 pt-4 pb-6">
                  <p className="text-textBlack700 line-clamp-2 leading-[24px] tracking-normal">
                    {item.content}
                  </p>
                  <Link
                    href={`/news/${item._id}`}
                    className="bg-link border-blue600 mt-auto w-full rounded-sm border-2 p-2 text-center"
                  >
                    Կարդալ ավելին
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={handleMore}
              disabled={loadingMore}
              className="bg-link border-blue600 my-16.5 self-start rounded-sm border-2 px-10 py-2 font-medium disabled:opacity-60"
            >
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Բեռնում...
                </span>
              ) : (
                "Տեսնել ավելին"
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
