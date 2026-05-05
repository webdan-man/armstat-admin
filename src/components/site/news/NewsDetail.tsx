"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

type NewsItem = {
  _id: string;
  title: string;
  content: string;
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

function formatDate(input?: string): string {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString("hy-AM");
}

interface NewsDetailProps {
  item: NewsItem;
  related: NewsItem[];
}

export default function NewsDetail({ item, related }: NewsDetailProps) {
  const { t } = useTranslation();
  const imageSrc = absolutizeUrl(item.image);
  const displayDate = formatDate(item.publishedAt ?? item.updatedAt ?? item.createdAt);

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full max-w-242.5 flex-col pt-9">
        <Link
          href="/news"
          className="text-textBlack600 text-fontSizeS flex items-center gap-2 leading-[24px] tracking-normal"
        >
          <Image src="/icons/back.svg" alt="back" width={24} height={24} />
          {t("news.title", "Նoorootioonnner")}
        </Link>

        <h2 className="text-textBlack800 mt-6 text-[30px] leading-10 font-semibold tracking-normal">
          {item.title}
        </h2>

        {(displayDate || item.url) && (
          <div className={"flex items-center justify-between gap-2"}>
            {displayDate && (
              <div className="flex justify-between">
                <p className="text-fontSizeM leading-fontLine-heightMD text-textBlack600 mt-3.75 tracking-normal">
                  {displayDate}
                </p>
              </div>
            )}
            {item.url && (
              <Link target="_blank" href={item.url} className="flex items-center gap-[9px]">
                <Image src={"/link.svg"} alt={"Link"} width={24} height={24} />
                <p className="leading-fontLine-heightMD text-link text-fontSizeS font-medium">
                  {t("news.share", "Taradztel")}
                </p>
              </Link>
            )}
          </div>
        )}

        {imageSrc && (
          <div className="relative mt-6 h-100 w-full overflow-hidden rounded-2xl">
            <Image src={imageSrc} alt={item.title} fill unoptimized />
          </div>
        )}

        <p className="text-textBlack800 mt-11 leading-[24px] tracking-normal whitespace-pre-line">
          {item.content}
        </p>
      </div>

      {related.length > 0 && (
        <div className="mt-39.5 flex w-full max-w-295 flex-col pb-53.5">
          <h3 className="text-fontSizeL font-semibold text-[rgba(44,44,44,1)]">
            {t("news.related", "Nmanatype norootioonnner")}
          </h3>
          <div className="mt-11.25 grid grid-cols-3 gap-10 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)] max-md:flex max-md:flex-col">
            {related.map((rel) => {
              const relImage = absolutizeUrl(rel.image);
              const relHref = rel.url && rel.url.startsWith("http") ? rel.url : `/news/${rel._id}`;

              return (
                <div key={rel._id} className="border-textBlack300 flex flex-col rounded-sm border">
                  <div className="flex flex-col items-start gap-2 px-6 pt-6 pb-4">
                    <p className="text-textBlack600 leading-[24px] tracking-normal">
                      {formatDate(rel.publishedAt ?? rel.updatedAt ?? rel.createdAt)}
                    </p>
                    <p className="text-fontSizeL text-textBlack800 line-clamp-2 leading-[24px] font-semibold tracking-normal">
                      {rel.title}
                    </p>
                  </div>
                  <div className="relative h-59.75 w-full">
                    <Image src={relImage ?? "/news/content.jpg"} alt={rel.title} fill unoptimized />
                  </div>
                  <div className="flex flex-col gap-4 px-6 pt-4 pb-6">
                    <p className="text-textBlack700 line-clamp-2 leading-[24px] tracking-normal">
                      {rel.content}
                    </p>
                    <Link
                      href={relHref}
                      className="bg-link border-blue600 w-full rounded-sm border-2 p-2 text-center"
                    >
                      {t("news.read_more", "Kartal avelin")}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
