"use client";

import { formatDisplayDate, formatDisplayDateTime } from "@/lib/format-display-date";
import { useLang } from "@/providers/LangProvider";

export function useFormatDisplayDate() {
  const { activeLang } = useLang();

  return {
    formatDisplayDate: (input?: string | Date | null) => formatDisplayDate(input, activeLang),
    formatDisplayDateTime: (input?: string | Date | null) =>
      formatDisplayDateTime(input, activeLang),
  };
}
