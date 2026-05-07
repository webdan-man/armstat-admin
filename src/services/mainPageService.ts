import apiClient from "@/lib/api/api-client";
import type {
  HomePageApiResponse,
  HomePageLocalizedText,
  HomePageUsefulLink,
} from "@/components/main/main-mock-data";

function appendImage(formData: FormData, field: string, value: File | string | null | undefined) {
  if (value instanceof File) {
    formData.append(field, value);
  } else if (typeof value === "string" && value) {
    formData.append(field, value);
  }
}

export async function fetchHomePage(): Promise<HomePageApiResponse> {
  return apiClient<HomePageApiResponse>("/api/home-page");
}

export type UpdateHomePageHeroPayload = {
  heroTitle: HomePageLocalizedText;
  heroShortDescription: HomePageLocalizedText;
  heroTextContent: HomePageLocalizedText;
  heroImage?: File | string | null;
};

export async function updateHomePageHero(payload: UpdateHomePageHeroPayload) {
  const formData = new FormData();

  formData.append("heroTitle", JSON.stringify(payload.heroTitle));
  formData.append("heroShortDescription", JSON.stringify(payload.heroShortDescription));
  formData.append("heroTextContent", JSON.stringify(payload.heroTextContent));
  appendImage(formData, "heroImage", payload.heroImage);
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
  featuredBlockImages: Array<File | string | null | undefined>;
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

  for (let i = 0; i < 3; i++) {
    appendImage(formData, `featuredBlockImage${i}`, images[i]);
  }

  return apiClient<HomePageApiResponse>("/api/home-page/featured-blocks", {
    method: "PUT",
    body: formData,
  });
}

export type UpdateHomePageUsefulLinksPayload = {
  usefulLinks: HomePageUsefulLink[];
  usefulLinkImages: Array<File | string | null | undefined>;
};

export async function updateHomePageUsefulLinks(payload: UpdateHomePageUsefulLinksPayload) {
  const links = payload.usefulLinks;
  const images = payload.usefulLinkImages.slice(0, links.length);
  const formData = new FormData();

  formData.append("usefulLinks", JSON.stringify(links));

  images.forEach((img, index) => {
    appendImage(formData, `usefulLinkImage${index}`, img);
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
