import { cookies } from "next/headers";
import { LANG_COOKIE, defaultLocale, parseLocale, type Locale } from "@/lib/i18n";

/** Matches LangProvider priority: URL ?lang= → cookie → default. */
export async function getActiveLocale(langParam?: string | null): Promise<Locale> {
  const fromParam = parseLocale(langParam);
  if (fromParam) return fromParam;

  const cookieStore = await cookies();
  const fromCookie = parseLocale(cookieStore.get(LANG_COOKIE)?.value);
  if (fromCookie) return fromCookie;

  return defaultLocale;
}
