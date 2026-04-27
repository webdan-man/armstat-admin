import apiClient from "@/lib/api/api-client";
import type { MainLangCode } from "@/components/main/main-mock-data";

export type LocalizedText = Partial<Record<MainLangCode, string>> & { hy?: string };

export type InformationCenterSection = {
  title: LocalizedText;
  description: LocalizedText;
  link: string;
  image: string;
};

export type InformationCenterApiResponse = {
  _id: string;
  title: LocalizedText;
  description: LocalizedText;
  image: string;
  sections: InformationCenterSection[];
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchInformationCenter(): Promise<InformationCenterApiResponse> {
  return apiClient<InformationCenterApiResponse>("/api/information-center");
}

export type UpdateInformationCenterPayload = {
  title: LocalizedText;
  description: LocalizedText;
  image?: File | null;
  sections: Array<{
    title: LocalizedText;
    description: LocalizedText;
    link: string;
    image: string;
  }>;
  sectionImages: Array<File | null | undefined>;
};

export async function updateInformationCenter(payload: UpdateInformationCenterPayload) {
  const formData = new FormData();
  formData.append("title", JSON.stringify(payload.title));
  formData.append("description", JSON.stringify(payload.description));
  formData.append(
    "sections",
    JSON.stringify(
      payload.sections.map((s) => ({
        title: s.title,
        description: s.description,
        link: s.link,
        image: s.image,
      }))
    )
  );

  if (payload.image) {
    formData.append("image", payload.image);
  }

  payload.sectionImages.slice(0, payload.sections.length).forEach((file, index) => {
    if (!file) return;
    formData.append(`sectionImage${index}`, file);
  });

  return apiClient<InformationCenterApiResponse>("/api/information-center", {
    method: "PUT",
    body: formData,
  });
}

