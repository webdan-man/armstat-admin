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
const NATIVE_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MAX_DATE_INPUT_DIGITS = 8;

export function extractDateInputDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, MAX_DATE_INPUT_DIGITS);
}

export function formatDateInputMask(digits: string): string {
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return day;
  if (digits.length <= 4) return `${day}.${month}`;
  return `${day}.${month}.${year}`;
}

export function applyDateInputMask(value: string): string {
  return formatDateInputMask(extractDateInputDigits(value));
}

export function getDateInputCaretPosition(
  previousMasked: string,
  nextMasked: string,
  previousCaret: number,
  isDelete = false
): number {
  const prevDigits = extractDateInputDigits(previousMasked);
  const nextDigits = extractDateInputDigits(nextMasked);
  const digitsBeforeCaret = extractDateInputDigits(
    previousMasked.slice(0, previousCaret)
  ).length;

  let targetDigitCount: number;
  if (isDelete) {
    targetDigitCount = Math.min(digitsBeforeCaret, nextDigits.length);
  } else if (nextDigits.length > prevDigits.length) {
    targetDigitCount = Math.min(
      digitsBeforeCaret + (nextDigits.length - prevDigits.length),
      nextDigits.length
    );
  } else {
    targetDigitCount = digitsBeforeCaret;
  }

  if (targetDigitCount <= 0) return 0;

  let digitCount = 0;
  for (let i = 0; i < nextMasked.length; i++) {
    if (/\d/.test(nextMasked[i])) {
      digitCount++;
      if (digitCount === targetDigitCount) {
        let pos = i + 1;
        if (
          !isDelete &&
          nextDigits.length > prevDigits.length &&
          nextMasked[pos] === "."
        ) {
          pos++;
        }
        return pos;
      }
    }
  }

  return nextMasked.length;
}

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

/** `dd.mm.yyyy` → `yyyy-mm-dd` for `<input type="date" />`. */
export function toNativeDateInputValue(dotValue: string): string {
  const date = parseDotDisplayDate(dotValue);
  if (!date) return "";

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** `yyyy-mm-dd` from `<input type="date" />` → `dd.mm.yyyy`. */
export function fromNativeDateInputValue(nativeValue: string): string {
  const trimmed = nativeValue.trim();
  if (!trimmed) return "";

  const match = trimmed.match(NATIVE_DATE_PATTERN);
  if (!match) return "";

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "";
  }

  return formatDotDate(date);
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

  const parts = new Intl.DateTimeFormat(intlLocaleBySiteLang[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(date);

  const day = parts.find((part) => part.type === "day")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const year = parts.find((part) => part.type === "year")?.value;

  if (!day || !month || !year) return formatDotDate(date);

  // Always dd.mm.yyyy (never US mm/dd/yyyy), but parts follow active locale.
  return `${day}.${month}.${year}`;
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

  return `${formatDotDate(date)} ${formatWithIntl(date, locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
}
