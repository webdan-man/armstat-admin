import apiClient from "@/lib/api/api-client";
import type { Section, SectionLocalizedText, Topic } from "@/types/section";

export async function fetchSections(): Promise<Section[]> {
  return apiClient<Section[]>("/api/sections");
}

export async function createSection(payload: {
  name: SectionLocalizedText;
  description: SectionLocalizedText;
}): Promise<Section> {
  return apiClient<Section>("/api/sections", {
    method: "POST",
    body: JSON.stringify({ name: payload.name.hy, description: payload.description.hy }),
  });
}

export type UpsertTopicPayload = {
  sectionId: string;
  parentTopicId?: string;
  title: string;
  body: string;
  order: number;
};

export async function getTopicById(topicId: string): Promise<Topic> {
  return apiClient<Topic>(`/api/topics/${topicId}`);
}

export async function getTopicSubtopics(topicId: string): Promise<Topic[]> {
  return apiClient<Topic[]>(`/api/topics/${topicId}/subtopics`);
}

export async function upsertTopic(payload: UpsertTopicPayload): Promise<Topic> {
  return apiClient<Topic>("/api/topics", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
