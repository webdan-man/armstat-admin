"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import useSWR, { mutate } from "swr";

import { LangSwitcher } from "@/components/main/LangSwitcher";
import type { MainLangCode } from "@/components/main/main-mock-data";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { swrKeys } from "@/lib/swr/cache-keys";
import { cn } from "@/lib/utils";
import { withToastError } from "@/lib/withToastError";
import { fetchContentEntries, updateContentEntries } from "@/services/contentEntriesService";
import type {
  ContentEntriesResponse,
  ContentEntry,
  ContentEntryRowItem,
} from "@/types/content-entries";

const fieldBorder =
  "rounded-[9px] border border-[#e6e7eb] bg-white text-[14px] text-[#2c2c2c] placeholder:text-[#646464] shadow-none";

type ContentRow = {
  key: string;
  hy: string;
  ru: string;
  en: string;
  hyDesc: string;
  ruDesc: string;
  enDesc: string;
};

type ContentFormValues = {
  rows: ContentRow[];
};

const EMPTY_ROW: ContentRow = {
  key: "",
  hy: "",
  ru: "",
  en: "",
  hyDesc: "",
  ruDesc: "",
  enDesc: "",
};

function ContentCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[10px] bg-white p-6 shadow-[0px_6px_7px_0px_rgba(0,0,0,0.05)]",
        className
      )}
    >
      {children}
    </div>
  );
}

function descKey(lang: MainLangCode): "hyDesc" | "ruDesc" | "enDesc" {
  if (lang === "hy") return "hyDesc";
  if (lang === "ru") return "ruDesc";
  return "enDesc";
}

function normalizeRows(data: ContentEntriesResponse): ContentRow[] {
  const dict: Record<string, ContentRow> = {};

  const fill = (entries: ContentEntry[] | undefined, locale: MainLangCode) => {
    if (!entries) return;
    for (const entry of entries) {
      if (!dict[entry.key]) {
        dict[entry.key] = { ...EMPTY_ROW, key: entry.key };
      }
      const row = dict[entry.key];
      row[locale] = entry.value ?? "";
      row[descKey(locale)] = entry.description ?? "";
    }
  };

  fill(data.hy, "hy");
  fill(data.en, "en");
  fill(data.ru, "ru");

  return Object.values(dict);
}

export function ContentPageEditor() {
  const { data, isLoading } = useSWR<ContentEntriesResponse>(
    swrKeys.contentEntries,
    fetchContentEntries
  );

  const form = useForm<ContentFormValues>({
    defaultValues: { rows: [] },
  });

  const {
    formState: { isDirty, isSubmitting, dirtyFields },
  } = form;

  const { fields, replace, append } = useFieldArray({
    control: form.control,
    name: "rows",
  });

  const [cardLangById, setCardLangById] = useState<Record<string, MainLangCode>>({});

  function getCardLang(fieldId: string): MainLangCode {
    return cardLangById[fieldId] ?? "hy";
  }

  function setCardLang(fieldId: string, next: MainLangCode) {
    setCardLangById((prev) => ({ ...prev, [fieldId]: next }));
  }

  useEffect(() => {
    if (!data) return;
    const rows = normalizeRows(data);
    replace(rows);
    form.reset({ rows });
  }, [data, replace, form]);

  function handleAdd() {
    append({ ...EMPTY_ROW });
  }

  async function onSubmit(values: ContentFormValues) {
    const items: ContentEntryRowItem[] = [];
    const dirtyRows = dirtyFields.rows ?? [];

    dirtyRows.forEach((dirtyRow, index) => {
      if (!dirtyRow) return;
      const row = values.rows[index];
      if (!row?.key?.trim()) return;

      if (dirtyRow.key) {
        items.push(
          { key: row.key, locale: "hy", value: row.hy, description: row.hyDesc },
          { key: row.key, locale: "en", value: row.en, description: row.enDesc },
          { key: row.key, locale: "ru", value: row.ru, description: row.ruDesc }
        );
        return;
      }

      if (dirtyRow.hy || dirtyRow.hyDesc) {
        items.push({
          key: row.key,
          locale: "hy",
          value: row.hy,
          description: row.hyDesc,
        });
      }
      if (dirtyRow.en || dirtyRow.enDesc) {
        items.push({
          key: row.key,
          locale: "en",
          value: row.en,
          description: row.enDesc,
        });
      }
      if (dirtyRow.ru || dirtyRow.ruDesc) {
        items.push({
          key: row.key,
          locale: "ru",
          value: row.ru,
          description: row.ruDesc,
        });
      }
    });

    if (!items.length) return;

    const result = await withToastError(() => updateContentEntries({ items }), {
      title: "Տեքստերը հաջողությամբ փոփոխվել են!",
      description: "Տեքստերը համակարգում հաջողությամբ թարմացվել են և այժմ հասանելի են։",
    });

    if (result) {
      await mutate(swrKeys.contentEntries);
      form.reset(values);
    }
  }

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-4 pb-10">
        <div className="text-[13px] text-[#646464]">Բեռնում...</div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form className="flex w-full flex-col gap-5 pb-10" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="sticky top-0 z-10 -mx-11 flex min-h-11 flex-col gap-4 bg-[#f9fafb] px-11 pt-7 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl leading-6 font-medium text-[#2c2c2c]">Բովանդակություն</h1>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleAdd}
              className="flex h-11 items-center gap-2 rounded-lg border border-[#e6e7eb] bg-white px-5 text-[13px] font-medium text-[#275199] shadow-none hover:bg-[#f5f7fb] hover:text-[#275199]"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-[#275199] text-white">
                <Plus className="size-3.5" strokeWidth={2.5} />
              </span>
              Ավելացնել նոր դաշտ
            </Button>
            <Button
              type="submit"
              disabled={!isDirty || isSubmitting}
              className={cn(
                "h-11 min-w-[256px] rounded-lg px-6 text-[13px] font-medium",
                isDirty && !isSubmitting
                  ? "border-0 bg-[#004d99] text-white hover:bg-[#004080]"
                  : "cursor-not-allowed border-0 bg-[#ededed] text-[#8b8b8b] hover:bg-[#ededed]"
              )}
            >
              {isSubmitting ? "Պահպանվում է..." : "Պահպանել փոփոխությունները"}
            </Button>
          </div>
        </div>

        {fields.length === 0 ? (
          <ContentCard>
            <p className="text-[13px] text-[#646464]">
              Դաշտեր դեռ չկան։ Ավելացրեք նոր դաշտ՝ սկսելու համար։
            </p>
          </ContentCard>
        ) : (
          fields.map((item, index) => {
            const lang = getCardLang(item.id);
            const valueName = `rows.${index}.${lang}` as const;
            const descName = `rows.${index}.${descKey(lang)}` as const;

            return (
              <ContentCard key={item.id}>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-end">
                    <LangSwitcher
                      value={lang}
                      onChange={(next) => setCardLang(item.id, next)}
                      className="sm:shrink-0"
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`rows.${index}.key`}
                    render={({ field }) => (
                      <FormItem className="gap-1">
                        <FormLabel className="text-[12px] font-normal text-[#575757]">
                          Բանալի (Key)
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Մուտքագրեք եզակի բանալին"
                            className={cn("h-9", fieldBorder)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={valueName}
                    render={({ field }) => (
                      <FormItem className="gap-1">
                        <FormLabel className="text-[12px] font-normal text-[#575757]">
                          Արժեք
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className={cn("min-h-[90px] resize-y", fieldBorder)}
                            placeholder="Մուտքագրեք տեքստը"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={descName}
                    render={({ field }) => (
                      <FormItem className="gap-1">
                        <FormLabel className="text-[12px] font-normal text-[#575757]">
                          Նկարագրություն
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Կամավոր նկարագրություն"
                            className={cn("h-9", fieldBorder)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </ContentCard>
            );
          })
        )}
      </form>
    </Form>
  );
}
