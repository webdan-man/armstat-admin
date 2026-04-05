import apiClient from "@/lib/api/api-client";
import type { Section } from "@/types/section";

export async function fetchSections(): Promise<Section[]> {
  return apiClient<Section[]>(`${process.env.NEXT_PUBLIC_BASE_URL}/sections`);
}
