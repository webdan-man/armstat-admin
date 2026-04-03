import { ApiError } from "./api-error";
import { redirect } from "next/navigation";

async function apiClient<T>(
    url: string,
    options: RequestInit & { parseAsText?: boolean } = {}
): Promise<T> {
    try {
        const isFormData = options.body instanceof FormData;

        const res = await fetch(url, {
            ...options,
            cache: "no-store",
            credentials: "include",
            headers: {
                ...(isFormData ? {} : { "Content-Type": "application/json" }),
                ...(options.headers || {}),
            },
        });

        if (res.status === 401) {
            if (typeof window !== "undefined") {
                window.location.href = "/logout";
            } else {
                redirect("/logout");
            }
        }

        if (!res.ok) {
            let errorBody: any = null;
            try {
                errorBody = await res.json();
                console.log(errorBody);
            } catch {}
            throw new ApiError(errorBody?.message || res.statusText, res.status, errorBody);
        }

        if (res.status === 204) return {} as T;

        const text = await res.text();
        if (!text) return {} as T;
        if (options.parseAsText) return text as unknown as T;
        return JSON.parse(text) as T;
    } catch (error: any) {
        console.log("kokkoo error", error);

        if (error instanceof ApiError) throw error;
        throw new ApiError(error.message || "Network error", error.status || undefined, error);
    }
}

export default apiClient;
