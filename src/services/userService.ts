import apiClient from "@/lib/api/api-client";
import { User, UsersResponse } from "@/types/users";

export async function getUsers() {
  return apiClient<UsersResponse["data"]>(`/api/users`);
}

export async function getUserById(id: string) {
  return apiClient<User>(`/api/users/${id}`);
}

export async function createUser(
  body: Pick<User, "firstName" | "lastName" | "email" | "password">
) {
  return apiClient(`/api/users`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateUser(
  id: string,
  body: Pick<User, "firstName" | "lastName" | "email" | "password">
) {
  return apiClient(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function updatePassword(data: { newPassword: string; currentPassword: string }) {
  return apiClient(`/api/auth/password`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string) {
  return apiClient(`/api/users/${id}`, {
    method: "DELETE",
  });
}
