import apiClient from "@/lib/api/api-client";
import type { HomePageNewsItem } from "@/components/main/main-mock-data";
import { sortNewsByLatestDate } from "@/utils/news.util";

export type NewsListResponse = {
  data: HomePageNewsItem[];
  total: number;
};

export async function fetchNews(): Promise<HomePageNewsItem[]> {
  const res = await apiClient<unknown>("/api/news");

  if (Array.isArray(res)) return sortNewsByLatestDate(res as HomePageNewsItem[]);
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    const candidates = [obj.items, obj.data, obj.news, obj.results, obj.rows];
    for (const c of candidates) {
      if (Array.isArray(c)) return sortNewsByLatestDate(c as HomePageNewsItem[]);
    }
  }

  return [];
}

export async function fetchNewsList({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Promise<NewsListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const res = await apiClient<unknown>(`/api/news?${params.toString()}`);

  if (res && typeof res === "object" && !Array.isArray(res)) {
    const obj = res as Record<string, unknown>;
    if (Array.isArray(obj.data)) {
      const data = sortNewsByLatestDate(obj.data as HomePageNewsItem[]);
      return {
        data,
        total: typeof obj.total === "number" ? obj.total : data.length,
      };
    }
  }

  if (Array.isArray(res)) {
    const data = sortNewsByLatestDate(res as HomePageNewsItem[]);
    return { data, total: data.length };
  }

  return { data: [], total: 0 };
}

/** News title/content are persisted per language as `{ hy, ru, en }`. */
export type LocalizedNewsPayloadText = { hy: string; ru: string; en: string };

export type CreateNewsPayload = {
  title: LocalizedNewsPayloadText;
  content: LocalizedNewsPayloadText;
  url: string;
  publishedAt: string;
};

export type NewsImageInput = {
  /** New file picked by the user; uploaded as multipart `image` part. */
  file?: File | null;
  /** Tells the server to clear the existing image (sends empty `image` field). */
  remove?: boolean;
};

function appendNewsFields(
  formData: FormData,
  payload: Partial<CreateNewsPayload>
): void {
  if (payload.title !== undefined) formData.append("title", JSON.stringify(payload.title));
  if (payload.content !== undefined)
    formData.append("content", JSON.stringify(payload.content));
  if (payload.url !== undefined) formData.append("url", payload.url);
  if (payload.publishedAt !== undefined)
    formData.append("publishedAt", payload.publishedAt);
}

function appendNewsImage(formData: FormData, image?: NewsImageInput): void {
  if (image?.file) {
    formData.append("image", image.file);
  } else if (image?.remove) {
    formData.append("image", "");
  }
}

export async function createNews(
  payload: CreateNewsPayload,
  image?: NewsImageInput
): Promise<HomePageNewsItem> {
  const formData = new FormData();
  appendNewsFields(formData, payload);
  appendNewsImage(formData, image);
  const created = await apiClient<HomePageNewsItem>("/api/news", {
    method: "POST",
    body: formData,
  });

  // POST /news accepts only title, content, and url — publishedAt is ignored.
  // PATCH is required to persist the publication date (same as the edit flow).
  if (!payload.publishedAt) return created;

  return updateNews(created._id, {
    title: payload.title,
    content: payload.content,
    url: payload.url,
    publishedAt: payload.publishedAt,
  });
}

export async function fetchNewsById(id: string): Promise<HomePageNewsItem> {
  return apiClient<HomePageNewsItem>(`/api/news/${encodeURIComponent(id)}`);
}

export async function updateNews(
  id: string,
  payload: Partial<CreateNewsPayload>,
  image?: NewsImageInput
): Promise<HomePageNewsItem> {
  const formData = new FormData();
  appendNewsFields(formData, payload);
  appendNewsImage(formData, image);
  return apiClient<HomePageNewsItem>(`/api/news/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: formData,
  });
}

export async function deleteNews(id: string): Promise<void> {
  await apiClient(`/api/news/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

