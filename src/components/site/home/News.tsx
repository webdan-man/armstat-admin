"use client";

import { useState } from "react";
import { TypographyH2, TypographyH3, TypographyP } from "@/components/ui/typography";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

type NewsItem = {
  _id: string;
  title: string;
  content: string;
  image?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
};

const PAGE_SIZE = 3;
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

function NewsCard({ item }: { item: NewsItem }) {
  const { t } = useTranslation();
  const imageSrc = absolutizeUrl(item.image) ?? "/news/content.jpg";
  const href = item.url && item.url.length > 0 ? item.url : `/news/${item._id}`;

  return (
    <div className="border-textBlack300 flex w-full flex-col rounded-lg border shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)]">
      <div className="flex w-full flex-col gap-2 px-6 pt-6 pb-4">
        <TypographyP className="text-textBlack600">
          {formatDate(item.updatedAt ?? item.createdAt)}
        </TypographyP>
        <TypographyH3 className="text-textBlack800 tracking-normal">{item.title}</TypographyH3>
      </div>
      <div className="relative h-59.75 w-full">
        <Image src={imageSrc} alt="News" fill unoptimized />
      </div>
      <div className="flex flex-1 flex-col gap-4 px-6 pt-6 pb-4">
        <TypographyP className="text-textBlack700 line-clamp-2 tracking-normal">
          {item.content}
        </TypographyP>
        <Link
          href={href}
          className="bg-link border-blue600 mt-auto w-full rounded-sm border-2 p-2 text-center"
        >
          {t("news.read_more", "Կարդալ ավելին")}
        </Link>
      </div>
    </div>
  );
}

function PaginationButton({
  onClick,
  disabled,
  active,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex h-9 min-w-9 items-center justify-center rounded-sm border px-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40",
        active
          ? "bg-link border-blue600 border-2 text-white"
          : "border-textBlack300 text-textBlack700 hover:bg-gray-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function News({ items }: { items: NewsItem[] }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <section className="flex w-full flex-col items-center">
      <div className="flex w-full max-w-305 flex-col items-start px-5 py-15">
        <TypographyH2 className="max-w-180 text-center font-medium text-[rgba(44,44,44,1)]">
          {t("news.title", "Նորություններ")}
        </TypographyH2>
        <div className="mt-15 grid grid-cols-3 gap-10 max-lg:flex max-lg:flex-col">
          {pageItems.map((item) => (
            <NewsCard key={item._id} item={item} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-10 flex items-center gap-2 self-center">
            <PaginationButton onClick={() => goTo(page - 1)} disabled={page === 1}>
              ‹
            </PaginationButton>

            {pageNumbers.map((n) => (
              <PaginationButton key={n} onClick={() => goTo(n)} active={n === page}>
                {n}
              </PaginationButton>
            ))}

            <PaginationButton onClick={() => goTo(page + 1)} disabled={page === totalPages}>
              ›
            </PaginationButton>
          </div>
        )}
      </div>
    </section>
  );
}
