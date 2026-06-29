"use client";

import { useCallback, useMemo } from "react";

import { formatDisplayDate, formatDisplayDateTime } from "@/lib/format-display-date";
import { useLang } from "@/providers/LangProvider";

export function useFormatDisplayDate() {
  const { activeLang } = useLang();

  const formatDisplayDateForLang = useCallback(
    (input?: string | Date | null) => formatDisplayDate(input, activeLang),
    [activeLang]
  );

  const formatDisplayDateTimeForLang = useCallback(
    (input?: string | Date | null) => formatDisplayDateTime(input, activeLang),
    [activeLang]
  );

  return {
    activeLang,
    formatDisplayDate: formatDisplayDateForLang,
    formatDisplayDateTime: formatDisplayDateTimeForLang,
  };
}

export function useFormattedDisplayDate(input?: string | Date | null): string {
  const { activeLang } = useLang();

  return useMemo(() => formatDisplayDate(input, activeLang), [input, activeLang]);
}
