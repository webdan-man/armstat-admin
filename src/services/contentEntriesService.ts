import apiClient from "@/lib/api/api-client";
import type {
  ContentEntriesResponse,
  ContentEntryRowItem,
} from "@/types/content-entries";

export async function fetchContentEntries(): Promise<ContentEntriesResponse> {
  return apiClient<ContentEntriesResponse>("/api/content-entries");
}

export async function updateContentEntries(payload: {
  items: ContentEntryRowItem[];
}): Promise<ContentEntriesResponse> {
  return apiClient<ContentEntriesResponse>("/api/content-entries/bulk", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
