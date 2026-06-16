import { useMemo } from "react";

export type SiteNavItem = {
  key: string;
  href: string;
  fallback: string;
};

/** Single source of truth for the site's primary navigation (Header + Footer). */
const NAV_ITEMS: SiteNavItem[] = [
  { key: "navigation.catalog", href: "/stat", fallback: "Catalog" },
  { key: "navigation.news", href: "/news", fallback: "Publications" },
  {
    key: "navigation.information_center",
    href: "/information-center",
    fallback: "Information Center",
  },
  { key: "navigation.feedback", href: "/feedback", fallback: "Feedback" },
];

/** Returns the primary nav items for Header and Footer. */
export function useSiteNavItems(): SiteNavItem[] {
  return useMemo(() => NAV_ITEMS, []);
}
