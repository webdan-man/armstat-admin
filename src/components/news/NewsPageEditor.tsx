"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import useSWRInfinite from "swr/infinite";

import {
  CreateNewsDialog,
  type CreateNewsFormValues,
  type NewsImageSubmitInfo,
} from "@/components/news/CreateNewsDialog";
import type { HomePageNewsItem } from "@/components/main/main-mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/api-error";
import { swrKeys } from "@/lib/swr/cache-keys";
import { cn } from "@/lib/utils";
import { formatDisplayDate, parseDotDisplayDate } from "@/lib/format-display-date";
import {
  getNewsDisplayDate,
  resolveLocalizedNewsText,
  sortNewsByLatestDate,
  toLocalizedNewsText,
} from "@/utils/news.util";
import {
  createNews,
  deleteNews,
  fetchNewsById,
  fetchNewsList,
  updateNews,
  type CreateNewsPayload,
  type NewsListResponse,
} from "@/services/newsService";

const PAGE_SIZE = 10;

const fieldBorder =
  "h-9 w-full rounded-[9px] border border-[#c8c8c8] bg-white pl-10 pr-3 text-[13px] text-[#2c2c2c] placeholder:text-[#646464] shadow-none";

type NewsListKey = readonly [...typeof swrKeys.newsList, number, number];

function formatPublishedLabel(item: HomePageNewsItem): string {
  const raw = getNewsDisplayDate(item);
  if (!raw) return "—";
  const formatted = formatDisplayDate(raw);
  return formatted || "—";
}

/** Display language for the admin list (falls back across languages). */
const LIST_DISPLAY_LANG = "hy" as const;

function newsListTitle(item: HomePageNewsItem): string {
  return resolveLocalizedNewsText(item.title, LIST_DISPLAY_LANG);
}

function filterByTitle(items: HomePageNewsItem[], query: string): HomePageNewsItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((n) => newsListTitle(n).toLowerCase().includes(q));
}

export function NewsPageEditor() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<CreateNewsFormValues | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState<string>("");
  const [localizedDraftsById, setLocalizedDraftsById] = useState<
    Record<string, CreateNewsFormValues>
  >({});
  const [editLoadingId, setEditLoadingId] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(() => new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const getKey = (
    pageIndex: number,
    previousPageData: NewsListResponse | null
  ): NewsListKey | null => {
    if (previousPageData && previousPageData.data.length === 0) return null;
    return [...swrKeys.newsList, pageIndex + 1, PAGE_SIZE] as NewsListKey;
  };

  const {
    data: pages,
    size,
    setSize,
    isLoading,
    isValidating,
    error,
    mutate: mutateNewsList,
  } = useSWRInfinite<NewsListResponse, Error, typeof getKey>(
    getKey,
    (key) => {
      const [, , page, limit] = key;
      return fetchNewsList({ page, limit });
    },
    { revalidateOnFocus: false, revalidateFirstPage: false }
  );

  const apiItems = useMemo(() => pages?.flatMap((p) => p.data) ?? [], [pages]);
  const total = pages?.[0]?.total ?? 0;
  const loadedCount = apiItems.length;
  const hasMore = loadedCount < total;
  const isLoadingMore = isValidating && pages !== undefined && size > pages.length;

  const allItems = useMemo<HomePageNewsItem[]>(() => {
    return sortNewsByLatestDate(apiItems.filter((item) => !hiddenIds.has(item._id)));
  }, [apiItems, hiddenIds]);

  const filtered = useMemo(() => filterByTitle(allItems, search), [allItems, search]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    if (!hasMore) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        if (isLoading || isValidating) return;
        setSize((current) => current + 1);
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isValidating, setSize, filtered.length]);

  const toPublishedAtIso = (value: string): string => parseDotDisplayDate(value)!.toISOString();

  const buildCreatePayload = (values: CreateNewsFormValues): CreateNewsPayload => ({
    title: { ...values.title },
    content: { ...values.content },
    url: "",
    publishedAt: toPublishedAtIso(values.publishedAt),
  });

  const buildUpdatePayload = (values: CreateNewsFormValues): Partial<CreateNewsPayload> => ({
    title: { ...values.title },
    content: { ...values.content },
    publishedAt: toPublishedAtIso(values.publishedAt),
  });

  const describeError = (e: unknown, fallback: string) =>
    e instanceof ApiError ? e.message || "Սերվերի սխալ։" : fallback;

  const cloneFormValues = (values: CreateNewsFormValues): CreateNewsFormValues => ({
    title: { ...values.title },
    content: { ...values.content },
    publishedAt: values.publishedAt,
  });

  const handleSaveNews = async (values: CreateNewsFormValues, image: NewsImageSubmitInfo) => {
    const isEdit = editingId !== null;
    const imageInput = { file: image.file, remove: image.removed };
    try {
      if (isEdit) {
        await updateNews(editingId!, buildUpdatePayload(values), imageInput);
        setLocalizedDraftsById((prev) => ({
          ...prev,
          [editingId!]: cloneFormValues(values),
        }));
        toast.success("Նորությունը թարմացվել է։");
      } else {
        await createNews(buildCreatePayload(values), imageInput);
        toast.success("Նորությունը ստեղծվել է։");
      }
      await mutateNewsList();
    } catch (e) {
      const description = describeError(
        e,
        isEdit ? "Չհաջողվեց թարմացնել նորությունը։" : "Չհաջողվեց ստեղծել նորությունը։"
      );
      toast.error("Սխալ!", { description });
      throw e;
    }
  };

  const handleCreateClick = () => {
    setEditingId(null);
    setEditingValues(null);
    setEditingImageUrl("");
    setDialogOpen(true);
  };

  const handleEditClick = async (id: string) => {
    setEditLoadingId(id);
    try {
      const news = await fetchNewsById(id);
      const cached = localizedDraftsById[id];
      const title = cached?.title ?? toLocalizedNewsText(news.title);
      const content = cached?.content ?? toLocalizedNewsText(news.content);
      setEditingId(id);
      setEditingValues({
        title,
        content,
        publishedAt:
          cached?.publishedAt ?? (news.publishedAt ? formatDisplayDate(news.publishedAt) : ""),
      });
      setEditingImageUrl(news.image ?? "");
      setDialogOpen(true);
    } catch (e) {
      toast.error("Սխալ!", {
        description: describeError(e, "Չհաջողվեց բեռնել նորությունը։"),
      });
    } finally {
      setEditLoadingId(null);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingId(null);
      setEditingValues(null);
      setEditingImageUrl("");
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingIds.has(id)) return;

    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    try {
      await deleteNews(id);
      toast.success("Ջնջված է։");
      await mutateNewsList();
      setHiddenIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (e) {
      setHiddenIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.error("Սխալ!", {
        description: describeError(e, "Չհաջողվեց ջնջել նորությունը։"),
      });
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const showInitialLoader = isLoading && !pages;
  const showError = error && !pages;
  const showEmpty = !showInitialLoader && !showError && filtered.length === 0;

  return (
    <div className="flex w-full flex-col gap-4 pb-10">
      <div className="sticky top-0 z-10 -mx-11 flex min-h-11 flex-col gap-4 bg-[#f9fafb] px-11 pt-7 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl leading-6 font-medium text-[#2c2c2c]">Նորություններ</h1>
        <Button
          type="button"
          className="h-11 shrink-0 rounded-lg border-0 bg-[#004d99] px-5 text-[13px] font-medium text-white hover:bg-[#004080]"
          onClick={handleCreateClick}
        >
          Ավելացնել
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
                <th className="px-4 py-3 font-medium text-[#2c2c2c]">Վերնագիր</th>
                <th className="w-36 px-4 py-3 font-medium whitespace-nowrap text-[#2c2c2c]">
                  Հրապարակվել է
                </th>
                <th className="w-[280px] px-4 py-3 font-medium text-[#2c2c2c]">Գործողություններ</th>
              </tr>
            </thead>
            <tbody>
              {showInitialLoader ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="size-6 animate-spin text-[#646464]" />
                    </div>
                  </td>
                </tr>
              ) : showError ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-[#c00]">
                    Չհաջողվեց բեռնել նորությունները։
                  </td>
                </tr>
              ) : showEmpty ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-[#646464]">
                    Ոչինչ չի գտնվել։
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row._id} className="border-b border-[#e6e7eb] last:border-b-0">
                    <td className="max-w-0 px-4 py-3 align-middle text-[#2c2c2c]">
                      <span className="line-clamp-2">{newsListTitle(row)}</span>
                    </td>
                    <td className="px-4 py-3 align-middle whitespace-nowrap text-[#2c2c2c]">
                      {formatPublishedLabel(row)}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={editLoadingId === row._id}
                          className={cn(
                            "h-8 rounded-md border-[#e6e7eb] bg-white text-[13px] font-normal text-[#2c2c2c] hover:bg-[#f9fafb]"
                          )}
                          onClick={() => handleEditClick(row._id)}
                        >
                          {editLoadingId === row._id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            "Դիտել և խմբագրել"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={deletingIds.has(row._id)}
                          className="h-8 rounded-md bg-[#c00] text-[13px] font-normal text-white hover:bg-[#a00]"
                          onClick={() => handleDelete(row._id)}
                        >
                          {deletingIds.has(row._id) ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            "Ջնջել"
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {hasMore && !showInitialLoader && !showError && (
          <div
            ref={sentinelRef}
            className="flex h-12 items-center justify-center text-[12px] text-[#646464]"
          >
            {isLoadingMore ? <Loader2 className="size-4 animate-spin" /> : "Բեռնում..."}
          </div>
        )}
      </div>

      <CreateNewsDialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
        onSubmitNews={handleSaveNews}
        mode={editingId ? "edit" : "create"}
        initialValues={editingValues ?? undefined}
        initialImageUrl={editingImageUrl}
      />
    </div>
  );
}
