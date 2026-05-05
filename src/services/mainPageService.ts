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
  heroImage?: File | null;
};

export async function updateHomePageHero(payload: UpdateHomePageHeroPayload) {
  const formData = new FormData();
  formData.append("heroTitle", JSON.stringify(payload.heroTitle));
  formData.append("heroShortDescription", JSON.stringify(payload.heroShortDescription));
  if (payload.heroImage) {
    formData.append("heroImage", payload.heroImage);
  }
  return apiClient<HomePageApiResponse>("/api/home-page/hero", {
    method: "PUT",
    body: formData,
  });
}

export type UpdateHomePageFeaturedBlocksPayload = {
  featuredBlocks: Array<{
    titleKey: string;
    sectionIds: string[];
  }>;
  featuredBlockImages: Array<File | null | undefined>;
};

export async function updateHomePageFeaturedBlocks(payload: UpdateHomePageFeaturedBlocksPayload) {
  const blocks = payload.featuredBlocks.slice(0, 3);
  const images = payload.featuredBlockImages.slice(0, 3);
  const formData = new FormData();

  formData.append(
    "featuredBlocks",
    JSON.stringify(
      blocks.map((b) => ({
        titleKey: b.titleKey,
        sectionIds: b.sectionIds,
      }))
    )
  );

  if (images[0]) formData.append("featuredBlockImage0", images[0]);
  if (images[1]) formData.append("featuredBlockImage1", images[1]);
  if (images[2]) formData.append("featuredBlockImage2", images[2]);

  return apiClient<HomePageApiResponse>("/api/home-page/featured-blocks", {
    method: "PUT",
    body: formData,
  });
}

export type UpdateHomePageUsefulLinksPayload = {
  usefulLinks: HomePageUsefulLink[];
  usefulLinkImages: Array<File | null | undefined>;
};

export async function updateHomePageUsefulLinks(payload: UpdateHomePageUsefulLinksPayload) {
  const links = payload.usefulLinks;
  const images = payload.usefulLinkImages.slice(0, links.length);

  const formData = new FormData();
  formData.append("usefulLinks", JSON.stringify(links));

  images.forEach((file, index) => {
    if (!file) return;
    formData.append(`usefulLinkImage${index}`, file);
  });

  return apiClient<HomePageApiResponse>("/api/home-page/useful-links", {
    method: "PUT",
    body: formData,
  });
}

export type UpdateHomePageNewsPayload = {
  newsIds: string[];
};

export async function updateHomePageNews(payload: UpdateHomePageNewsPayload) {
  return apiClient<HomePageApiResponse>("/api/home-page/news", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
