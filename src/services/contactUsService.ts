import type { MainLangCode } from "@/components/main/main-mock-data";
import apiClient from "@/lib/api/api-client";

export type LocalizedText = Partial<Record<MainLangCode, string>> & { hy?: string };

export type ContactUsSectionAddress = {
  type: "address";
  value: string;
};

export type ContactUsSectionInfo = {
  type: "info";
  title: string;
  phone: string;
  email: string;
  link: string;
};

export type ContactUsSection = ContactUsSectionAddress | ContactUsSectionInfo;

export type ContactUsMapSection = {
  title: string;
  value: string;
};

export type ContactUsApiResponse = {
  _id: string;
  title: LocalizedText;
  description: LocalizedText;
  sections: ContactUsSection[];
  mapSection: ContactUsMapSection;
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchContactUs(): Promise<ContactUsApiResponse> {
  return apiClient<ContactUsApiResponse>("/api/contact-us");
}

export type UpdateContactUsPayload = {
  title: LocalizedText;
  description: LocalizedText;
  sections: ContactUsSection[];
  mapSection: ContactUsMapSection;
};

export async function updateContactUs(payload: UpdateContactUsPayload): Promise<ContactUsApiResponse> {
  return apiClient<ContactUsApiResponse>("/api/contact-us", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

