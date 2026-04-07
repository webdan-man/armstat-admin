import apiClient from "@/lib/api/api-client";
import { Attribute } from "@/types/attribute";

export async function fetchAttributes() {
  return apiClient<Attribute[]>("/api/attributes");
}

export async function fetchAttributeCategories() {
  return apiClient<string[]>("/api/attributes/categories");
}

export async function createAttribute(payload: {
  category: string;
}): Promise<Attribute> {
  return apiClient<Attribute>(`/api/attributes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getLibraryFromAttributeById(id: string): Promise<Attribute> {
  return apiClient<Attribute>(`/api/attributes/${id}`, {
    method: "GET",
  });
}

export async function saveAttributeLibrary(payload: {
  category: string;
  id?: string;
  translations?: { am: string; ru: string; en: string };
  mode: "create" | "edit";
}): Promise<Attribute> {
  const { mode, ...body } = payload;

  switch (mode) {
    case "create":
      return apiClient<Attribute>(`/api/attributes`, {
        method: "POST",
        body: JSON.stringify(body),
      });

    case "edit":
      if (!body.id) {
        throw new Error("Missing attribute id");
      }
      return apiClient<Attribute>(`/api/attributes/${body.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
  }
}

export async function importAttributesFromCSV(payload: {
  file: File;
  id: string;
}): Promise<{ inserted: number }> {
  const { id, file } = payload;

  const formData = new FormData();
  formData.append("file", file);

  return apiClient(`/api/attributes/csv?id=${id}`, {
    method: "POST",
    body: formData,
  });
}

export async function downloadAttributesAsCSV(id: string): Promise<void> {
  const csvText = await apiClient<string>(`/api/attributes/csv?id=${id}`, {
    headers: { Accept: "text/csv" },
    parseAsText: true,
  });

  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${id}-attributes.csv`;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function deleteAttribute(id: string) {
  return apiClient<Attribute>(`/api/attributes/${id}`, {
    method: "DELETE",
  });
}
