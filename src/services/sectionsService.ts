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
    body: JSON.stringify({ name: payload.name, description: payload.description }),
  });
}

export async function updateSection(
  sectionId: string,
  payload: { name: SectionLocalizedText; description: SectionLocalizedText }
): Promise<Section> {
  return apiClient<Section>(`/api/sections/${sectionId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export type UpsertTopicPayload = {
  sectionId: string;
  parentTopicId?: string;
  title: SectionLocalizedText;
  body: SectionLocalizedText;
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

export async function updateTopic(
  topicId: string,
  payload: Partial<UpsertTopicPayload>
): Promise<Topic> {
  return apiClient<Topic>(`/api/topics/${topicId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTopic(topicId: string): Promise<void> {
  return apiClient<void>(`/api/topics/${topicId}`, { method: "DELETE" });
}

export async function deleteSection(sectionId: string): Promise<void> {
  return apiClient<void>(`/api/sections/${sectionId}`, { method: "DELETE" });
}

export async function reorderSections(ids: string[]): Promise<void> {
  return apiClient<void>("/api/sections/reorder", {
    method: "PATCH",
    body: JSON.stringify({ ids }),
  });
}

export async function reorderTopics(ids: string[]): Promise<void> {
  return apiClient<void>("/api/topics/reorder", {
    method: "PATCH",
    body: JSON.stringify({ ids }),
  });
}
