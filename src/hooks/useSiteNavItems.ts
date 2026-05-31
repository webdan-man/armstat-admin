import { useMemo } from "react";
import useSWR from "swr";
import { fetchSections } from "@/services/sectionsService";
import { swrKeys } from "@/lib/swr/cache-keys";
import { isRootTopic } from "@/lib/section-topic-utils";

export type SiteNavItem = {
  key: string;
  href: string;
  fallback: string;
};

/** Single source of truth for the site's primary navigation (Header + Footer). */
const NAV_ITEMS: SiteNavItem[] = [
  { key: "navigation.catalog", href: "catalog", fallback: "Catalog" },
  { key: "navigation.news", href: "/news", fallback: "Publications" },
  {
    key: "navigation.information_center",
    href: "/information-center",
    fallback: "Information Center",
  },
  { key: "navigation.feedback", href: "/feedback", fallback: "Feedback" },
];

/**
 * Returns the primary nav items with the "catalog" entry resolved to the first
 * root topic's stat page. Sections are fetched via SWR (shared cache key), so
 * Header and Footer reuse the same request.
 */
export function useSiteNavItems(): SiteNavItem[] {
  const { data: sections = [] } = useSWR(swrKeys.sections, fetchSections);

  const catalogHref = useMemo(() => {
    for (const section of sections) {
      const first = section.topics.find(isRootTopic);
      if (first) return `/stat/${first._id}`;
    }
    return "/stat";
  }, [sections]);

  return useMemo(
    () => NAV_ITEMS.map((item) => (item.href === "catalog" ? { ...item, href: catalogHref } : item)),
    [catalogHref]
  );
}
