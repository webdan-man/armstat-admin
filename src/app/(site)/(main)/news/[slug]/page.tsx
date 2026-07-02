import { notFound } from "next/navigation";
import NewsDetail from "@/components/site/news/NewsDetail";
import { sortNewsByLatestDate } from "@/utils/news.util";

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

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

async function getNewsItem(id: string): Promise<NewsItem | null> {
  if (!BASE_URL) return null;
  try {
    const res = await fetch(`${BASE_URL}/news/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return (await res.json()) as NewsItem;
  } catch {
    return null;
  }
}

async function getRelatedNews(excludeId: string): Promise<NewsItem[]> {
  if (!BASE_URL) return [];
  try {
    const res = await fetch(`${BASE_URL}/news?limit=4&page=1`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { data: NewsItem[]; total: number };
    return sortNewsByLatestDate(data.data ?? [])
      .filter((item) => item._id !== excludeId)
      .slice(0, 3);
  } catch {
    return [];
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [item, related] = await Promise.all([getNewsItem(slug), getRelatedNews(slug)]);

  if (!item) return notFound();

  return <NewsDetail item={item} related={related} />;
}
