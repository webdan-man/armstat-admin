import apiClient from "@/lib/api/api-client";
import { Attribute } from "@/types/attribute";

export async function fetchAttributes() {
    return apiClient<Attribute[]>(`${process.env.NEXT_PUBLIC_BASE_URL}/attributes`);
}

export async function importAttributesFromCSV(payload: {
    file: File;
    key: string;
}): Promise<{ inserted: number }> {
    const { key, file } = payload;

    const formData = new FormData();
    formData.append("file", file);

    return apiClient(`/api/attributes/csv?key=${key}`, {
        method: "POST",
        body: formData,
    });
}

export async function downloadAttributesAsCSV(): Promise<void> {
    const csvText = await apiClient<string>(`/api/attributes/csv`, {
        headers: { Accept: "text/csv" },
        parseAsText: true,
    });

    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "attributes.csv";
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
