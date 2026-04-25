import apiClient from "@/lib/api/api-client";
import type { HomePageNewsItem } from "@/components/main/main-mock-data";

export async function fetchNews(): Promise<HomePageNewsItem[]> {
  const res = await apiClient<unknown>("/api/news");

  if (Array.isArray(res)) return res as HomePageNewsItem[];
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    const candidates = [obj.items, obj.data, obj.news, obj.results, obj.rows];
    for (const c of candidates) {
      if (Array.isArray(c)) return c as HomePageNewsItem[];
    }
  }

  return [];
}

