import apiClient from "@/lib/api/api-client";
import { PermissionsResponse } from "@/types/permissions";

export async function getPermissions() {
  return apiClient<PermissionsResponse>(`/api/permissions?limit=1000`);
}
