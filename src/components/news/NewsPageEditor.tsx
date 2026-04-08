"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import {
  CreateNewsDialog,
  type CreateNewsFormValues,
} from "@/components/news/CreateNewsDialog";
import {
  MOCK_NEWS_ITEMS,
  type NewsItem,
} from "@/components/news/news-mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const fieldBorder =
  "h-9 w-full rounded-[9px] border border-[#c8c8c8] bg-white pl-10 pr-3 text-[13px] text-[#2c2c2c] placeholder:text-[#646464] shadow-none";

function filterByTitle(items: NewsItem[], query: string): NewsItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((n) => n.title.toLowerCase().includes(q));
}

export function NewsPageEditor() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<NewsItem[]>(() => [...MOCK_NEWS_ITEMS]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filtered = useMemo(
    () => filterByTitle(items, search),
    [items, search]
  );

  const formatPublishedLabel = (publishedAt: string): string => {
    const [year, month, day] = publishedAt.split("-");
    if (!year || !month || !day) return publishedAt;
    return `${month}/${day}/${year}`;
  };

  const resolveTitleForList = (values: CreateNewsFormValues): string => {
    return (
      values.title.hy.trim() ||
      values.title.ru.trim() ||
      values.title.en.trim()
    );
  };

  const createNews = (values: CreateNewsFormValues) => {
    const listTitle = resolveTitleForList(values);
    const publishedLabel = formatPublishedLabel(values.publishedAt);
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`;

    const nextItem: NewsItem = {
      id,
      title: listTitle,
      publishedLabel,
      link: values.link.trim(),
      publishedAt: values.publishedAt,
      titleTranslations: {
        hy: values.title.hy.trim(),
        ru: values.title.ru.trim(),
        en: values.title.en.trim(),
      },
      contentTranslations: {
        hy: values.content.hy.trim(),
        ru: values.content.ru.trim(),
        en: values.content.en.trim(),
      },
    };

    setItems((prev) => [nextItem, ...prev]);
    toast.success("Նորությունը ստեղծվել է (մոկ)։");
  };

  return (
    <div className="flex w-full flex-col gap-4 pb-10">
      <div className="flex min-h-11 w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl leading-6 font-medium text-[#2c2c2c]">
          Նորություններ
        </h1>
        <Button
          type="button"
          className="h-11 shrink-0 rounded-lg border-0 bg-[#004d99] px-5 text-[13px] font-medium text-white hover:bg-[#004080]"
          onClick={() => setCreateDialogOpen(true)}
        >
          Ավելացնել Լուր
        </Button>
      </div>

      <div className="relative w-full max-w-full">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#646464]"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Որոնում վերնագրով..."
          className={fieldBorder}
          aria-label="Որոնում վերնագրով"
        />
      </div>

      <div className="overflow-hidden rounded-[10px] bg-white shadow-[0px_6px_7px_0px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#e6e7eb] bg-[#fafafa]">
                <th className="px-4 py-3 font-medium text-[#2c2c2c]">
                  Վերնագիր
                </th>
                <th className="w-36 px-4 py-3 font-medium whitespace-nowrap text-[#2c2c2c]">
                  Հրապարակվել է
                </th>
                <th className="w-[280px] px-4 py-3 font-medium text-[#2c2c2c]">
                  Գործողություններ
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-[#646464]"
                  >
                    Ոչինչ չի գտնվել։
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#e6e7eb] last:border-b-0"
                  >
                    <td className="max-w-0 px-4 py-3 align-middle text-[#2c2c2c]">
                      <span className="line-clamp-2">{row.title}</span>
                    </td>
                    <td className="px-4 py-3 align-middle whitespace-nowrap text-[#2c2c2c]">
                      {row.publishedLabel}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-8 rounded-md border-[#e6e7eb] bg-white text-[13px] font-normal text-[#2c2c2c] hover:bg-[#f9fafb]"
                          )}
                          onClick={() =>
                            toast.message("Խմբագրումը կկապվի API-ի հետ։")
                          }
                        >
                          Դիտել և խմբագրել
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-8 rounded-md bg-[#c00] text-[13px] font-normal text-white hover:bg-[#a00]"
                          onClick={() => {
                            setItems((list) =>
                              list.filter((n) => n.id !== row.id)
                            );
                            toast.success("Ջնջված է (մոկ)։");
                          }}
                        >
                          Ջնջել
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <CreateNewsDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmitNews={createNews}
      />
    </div>
  );
}
