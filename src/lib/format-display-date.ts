import { defaultLocale, type Locale } from "@/lib/i18n";

/** BCP-47 tags for display dates; en-GB avoids US mm/dd/yyyy. */
const intlLocaleBySiteLang: Record<Locale, string> = {
  hy: "hy-AM",
  ru: "ru-RU",
  en: "en-GB",
};

function parseDisplayDate(input?: string | Date | null): Date | null {
  if (input == null || input === "") return null;

  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatDotDate(date: Date): string {
  return `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()}`;
}

const DOT_DATE_PATTERN = /^(\d{2})\.(\d{2})\.(\d{4})$/;

export function parseDotDisplayDate(value: string): Date | null {
  const trimmed = value.trim();
  const match = trimmed.match(DOT_DATE_PATTERN);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDotDateTime(date: Date): string {
  return `${formatDotDate(date)} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatWithIntl(date: Date, locale: Locale, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(intlLocaleBySiteLang[locale], options).format(date);
}

export function formatDisplayDate(
  input?: string | Date | null,
  locale: Locale = defaultLocale
): string {
  const date = parseDisplayDate(input);
  if (!date) return typeof input === "string" ? input : "";

  if (locale === "hy" || locale === "ru") {
    return formatDotDate(date);
  }

  return formatWithIntl(date, locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDisplayDateTime(
  input?: string | Date | null,
  locale: Locale = defaultLocale
): string {
  const date = parseDisplayDate(input);
  if (!date) return typeof input === "string" ? input : "";

  if (locale === "hy" || locale === "ru") {
    return formatDotDateTime(date);
  }

  return formatWithIntl(date, locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
