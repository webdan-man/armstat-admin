/**
 * Seeds header/footer content entries (English locale) into the backend.
 * Armenian translations can be added later via /admin/content.
 *
 * Usage (from project root):
 *   npx tsx scripts/seed-content.ts
 *
 * Environment variables (optional, fall back to .env.local demo values):
 *   NEXT_PUBLIC_BASE_URL  – backend base URL
 *   SEED_EMAIL            – admin email
 *   SEED_PASSWORD         – admin password
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://armstat-backend.it.massiv.cc";
const EMAIL = process.env.SEED_EMAIL ?? "admin@gov.am";
const PASSWORD = process.env.SEED_PASSWORD ?? "admin123";

type Locale = "hy" | "en";

interface ContentEntry {
  key: string;
  locale: Locale;
  value: string;
  description: string;
}

/**
 * All content keys used in Header and Footer.
 * Add "hy" locale values via /admin/content.
 */
const entries: ContentEntry[] = [
  // ── Navigation (shared by Header & Footer) ──────────────────────────────
  {
    key: "navigation.catalog",
    locale: "en",
    value: "Catalog",
    description: "Navigation link – Catalog",
  },
  {
    key: "navigation.news",
    locale: "en",
    value: "Publications",
    description: "Navigation link – Publications",
  },
  {
    key: "navigation.information_center",
    locale: "en",
    value: "Information Center",
    description: "Navigation link – Information Center",
  },
  {
    key: "navigation.feedback",
    locale: "en",
    value: "Feedback",
    description: "Navigation link – Feedback",
  },

  // ── Header ──────────────────────────────────────────────────────────────
  {
    key: "header.site_title",
    locale: "en",
    value: "Statistical Committee of the Republic of Armenia ARMSTAT",
    description: "Header – hidden H1 site title (for SEO)",
  },
  {
    key: "language.hy",
    locale: "en",
    value: "Armenian",
    description: "Language switcher – Armenian option label",
  },
  {
    key: "language.en",
    locale: "en",
    value: "English",
    description: "Language switcher – English option label",
  },

  // ── Footer ──────────────────────────────────────────────────────────────
  {
    key: "footer.hotline.label",
    locale: "en",
    value: "Hotline:",
    description: "Footer – hotline section label",
  },
  {
    key: "footer.hotline.phone",
    locale: "en",
    value: "+374 60 510 610",
    description: "Footer – hotline phone number",
  },
  {
    key: "footer.phone.label",
    locale: "en",
    value: "Phone:",
    description: "Footer – phone section label",
  },
  {
    key: "footer.phone.number",
    locale: "en",
    value: "+374 11 524 213",
    description: "Footer – general phone number",
  },
  {
    key: "footer.email.label",
    locale: "en",
    value: "Official e-mail:",
    description: "Footer – email section label",
  },
  {
    key: "footer.email.address",
    locale: "en",
    value: "info@armstat.am",
    description: "Footer – official email address",
  },
  {
    key: "footer.copyright",
    locale: "en",
    value:
      "© 2025 Statistical Committee of the Republic of Armenia ARMSTAT. All rights reserved.",
    description: "Footer – copyright notice",
  },
];

async function main() {
  console.log(`Backend: ${BASE_URL}`);
  console.log(`Logging in as ${EMAIL} ...`);

  const loginRes = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!loginRes.ok) {
    const text = await loginRes.text();
    throw new Error(`Login failed (${loginRes.status}): ${text}`);
  }

  const setCookie = loginRes.headers.get("set-cookie");
  if (!setCookie) throw new Error("No Set-Cookie header in login response");

  const cookieHeader = setCookie
    .split(",")
    .map((c: string) => c.split(";")[0].trim())
    .join("; ");

  console.log(`Seeding ${entries.length} entries ...`);

  const seedRes = await fetch(`${BASE_URL}/content-entries/bulk`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ items: entries }),
  });

  if (!seedRes.ok) {
    const text = await seedRes.text();
    throw new Error(`Seed failed (${seedRes.status}): ${text}`);
  }

  console.log(`✓ Done. Open /admin/content to add Armenian translations.`);
}

main().catch((err: Error) => {
  console.error("Error:", err.message);
  process.exit(1);
});
