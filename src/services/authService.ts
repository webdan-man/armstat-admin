import apiClient from "@/lib/api/api-client";

export async function updatePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  return apiClient<void>("/api/auth/password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
