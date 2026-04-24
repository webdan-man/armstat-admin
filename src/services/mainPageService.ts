import apiClient from "@/lib/api/api-client";
import type {
  HomePageApiResponse,
  HomePageLocalizedText,
  HomePageUsefulLink,
} from "@/components/main/main-mock-data";

export async function fetchHomePage(): Promise<HomePageApiResponse> {
  return apiClient<HomePageApiResponse>("/api/home-page");
}

export type UpdateHomePageHeroPayload = {
  heroTitle: HomePageLocalizedText;
  heroShortDescription: HomePageLocalizedText;
  heroTextContent: HomePageLocalizedText;
  heroImage: string;
};

export async function updateHomePageHero(payload: UpdateHomePageHeroPayload) {
  return apiClient<HomePageApiResponse>("/home-page/hero", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export type UpdateHomePageFeaturedBlocksPayload = {
  featuredBlocks: Array<{
    titleKey: string;
    sectionIds: string[];
    image: string;
  }>;
};

export async function updateHomePageFeaturedBlocks(
  payload: UpdateHomePageFeaturedBlocksPayload
) {
  return apiClient<HomePageApiResponse>("/home-page/featured-blocks", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export type UpdateHomePageUsefulLinksPayload = {
  usefulLinks: HomePageUsefulLink[];
};

export async function updateHomePageUsefulLinks(payload: UpdateHomePageUsefulLinksPayload) {
  return apiClient<HomePageApiResponse>("/home-page/useful-links", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export type UpdateHomePageNewsPayload = {
  newsIds: string[];
};

export async function updateHomePageNews(payload: UpdateHomePageNewsPayload) {
  return apiClient<HomePageApiResponse>("/home-page/news", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
