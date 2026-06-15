"use client";

import { SWRConfig } from "swr";

export function SWRProvider({
    children,
    fallback,
}: {
    children: React.ReactNode;
    /** Server-fetched data keyed by SWR cache key, to seed the cache on first render. */
    fallback?: Record<string, unknown>;
}) {
    return (
        <SWRConfig
            value={{
                revalidateOnFocus: false,
                revalidateOnReconnect: true,
                dedupingInterval: 60000,
                fallback: fallback ?? {},
            }}
        >
            {children}
        </SWRConfig>
    );
}
