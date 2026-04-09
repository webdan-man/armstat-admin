"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  fetchAttributeCategories,
  fetchAttributes,
  getLibraryFromAttributeById,
} from "@/services/attributeService";
import { swrKeys } from "@/lib/swr/cache-keys";
import { useIndicatorFeatures } from "@/components/indicators/indicator-features-context";
import {
  buildLibraryDisplay,
  buildLibraryOptions,
} from "@/components/indicators/attribute-library-helpers";
import {
  emptyIndicatorFeatureRow,
  indicatorFeaturesBatchFormSchema,
  type IndicatorFeaturesBatchFormValues,
} from "@/components/indicators/indicator-feature-form-schema";
import type { Attribute } from "@/types/attribute";
import { cn } from "@/lib/utils";

const LEVEL_OPTIONS = [
  { value: "primary", label: "Հիմնական" },
  { value: "secondary", label: "Երկրորդային" },
] as const;

export default function CreateWindow() {
  const { features, dialogOpen, editingId, setDialogOpen, startCreate, addFeature, updateFeature } =
    useIndicatorFeatures();

  const { data: attributesCategories = [] } = useSWR(
    swrKeys.attributesCategories,
    fetchAttributeCategories
  );
  const { data: attributes, isLoading } = useSWR(swrKeys.attributes, fetchAttributes);
  const editing = editingId ? features.find((f) => f.id === editingId) : undefined;
  const isEdit = Boolean(editingId && editing);

  const form = useForm<IndicatorFeaturesBatchFormValues>({
    resolver: zodResolver(indicatorFeaturesBatchFormSchema),
    defaultValues: {
      rows: [emptyIndicatorFeatureRow()],
    },
  });

  const { control, handleSubmit, reset, setValue } = form;
  const [valuesPopoverOpenByRow, setValuesPopoverOpenByRow] = useState<Record<number, boolean>>({});

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rows",
  });

  const resolveEditCategory = (feature: NonNullable<typeof editing>): string => {
    const featureCategory = feature.category?.trim();
    if (featureCategory) return featureCategory;
    const attributeCategory = attributeByKey[feature.attributeKey]?.category?.trim();
    if (attributeCategory) return attributeCategory;
    return "";
  };

  const rowsWatch = useWatch({ control, name: "rows" });
  const selectedAttributeKeys = useMemo(() => {
    const keys = (rowsWatch ?? []).map((row) => row?.libraryOption).filter(Boolean);
    return Array.from(new Set(keys)).sort((a, b) => a.localeCompare(b));
  }, [rowsWatch]);

  const detailsKey = useMemo(
    () =>
      selectedAttributeKeys.length > 0
        ? ([swrKeys.attributes, "details", ...selectedAttributeKeys] as const)
        : null,
    [selectedAttributeKeys]
  );

  const { data: attributeByKey = {}, isLoading: isLoadingAttributeDetails } = useSWR<
    Record<string, Attribute | null>
  >(detailsKey, async () => {
    const entries = await Promise.all(
      selectedAttributeKeys.map(async (key) => {
        try {
          const attribute = await getLibraryFromAttributeById(key);
          return [key, attribute] as const;
        } catch {
          return [key, null] as const;
        }
      })
    );
    return Object.fromEntries(entries);
  });

  useEffect(() => {
    if (!dialogOpen) return;
    if (editing) {
      reset({
        rows: [
          {
            category: resolveEditCategory(editing),
            libraryOption: editing.attributeKey,
            levelOption: editing.level,
            valueIds: editing.valueIds ?? [],
          },
        ],
      });
    } else {
      reset({
        rows: [emptyIndicatorFeatureRow()],
      });
    }
  }, [dialogOpen, editingId, editing, reset]);

  useEffect(() => {
    if (!dialogOpen || !isEdit || !editing) return;
    const currentCategory = rowsWatch?.[0]?.category?.trim() ?? "";
    if (currentCategory) return;

    const resolvedCategory = resolveEditCategory(editing);
    if (!resolvedCategory) return;

    setValue("rows.0.category", resolvedCategory, { shouldValidate: true });
  }, [dialogOpen, isEdit, editing, rowsWatch, setValue, attributeByKey]);

  useEffect(() => {
    const rows = rowsWatch ?? [];
    rows.forEach((row, index) => {
      const selectedLibrary = row?.libraryOption ?? "";
      if (!selectedLibrary) return;
      const selectedAttribute = attributeByKey[selectedLibrary];
      if (!selectedAttribute) return;

      if (selectedAttribute.values?.length > 0 && row.levelOption !== "primary") {
        setValue(`rows.${index}.levelOption`, "primary", { shouldValidate: true });
      }
    });
  }, [rowsWatch, attributeByKey, setValue]);

  const onSubmit = (values: IndicatorFeaturesBatchFormValues) => {
    if (!attributes?.length) return;
    if (isEdit && editing) {
      const row = values.rows[0];
      const selectedAttribute = attributeByKey[row.libraryOption];
      const selectedLabels = (selectedAttribute?.values ?? [])
        .filter((v) => row.valueIds.includes(v._id))
        .map((v) => v.title?.hy);
      const libraryDisplay =
        selectedLabels.length > 0
          ? selectedLabels.join(", ")
          : buildLibraryDisplay(attributes, row.libraryOption, row.levelOption);

      updateFeature(editing.id, {
        category: row.category,
        attributeKey: row.libraryOption,
        attributeKeyLabel: selectedAttribute?.title["hy"] ?? "",
        level: row.levelOption as "primary" | "secondary",
        valueIds: row.valueIds,
        libraryDisplay,
      });
    } else {
      for (const row of values.rows) {
        const selectedAttribute = attributeByKey[row.libraryOption];
        const selectedLabels = (selectedAttribute?.values ?? [])
          .filter((v) => row.valueIds.includes(v._id))
          .map((v) => v.title?.hy);
        const libraryDisplay =
          selectedLabels.length > 0
            ? selectedLabels.join(", ")
            : buildLibraryDisplay(attributes, row.libraryOption, row.levelOption);

        addFeature({
          category: row.category,
          attributeKey: row.libraryOption,
          attributeKeyLabel: selectedAttribute?.title?.["hy"] ?? "",
          level: row.levelOption as "primary" | "secondary",
          valueIds: row.valueIds,
          libraryDisplay,
        });
      }
    }
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <button
        type="button"
        onClick={startCreate}
        className="mt-2 flex cursor-pointer items-center gap-3.25 self-center"
      >
        <Image src="/add.svg" width={24} height={24} alt="" />
        <span className="text-[14px] leading-3.5 font-medium text-[rgba(39,81,153,1)]">
          Ավել Հատկանիշ
        </span>
      </button>
      <DialogContent className="">
        <DialogHeader className="px-6 py-5">
          <DialogTitle className="text-[18px] leading-3.5 font-semibold text-[rgba(44,44,44,1)]">
            {isEdit ? "Խմբագրել հատկանիշ" : "Հատկանիշ"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="no-scrollbar -mx-4 max-h-[80vh] overflow-y-auto">
              {isLoading && (
                <div className="flex items-center gap-2 px-6 py-4 text-sm text-zinc-600">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Բեռնում…</span>
                </div>
              )}
              <div className="flex w-full flex-col">
                {fields.map((field, index) => {
                  const selectedCategory = rowsWatch?.[index]?.category ?? "";
                  const selectedLibrary = rowsWatch?.[index]?.libraryOption ?? "";
                  const libraryOptions = buildLibraryOptions(attributes, selectedCategory);

                  const levelOptions = selectedLibrary
                    ? (attributeByKey[selectedLibrary]?.values ?? [])
                    : [];
                  const currentRow = rowsWatch?.[index];
                  const selectedValueIds = currentRow?.valueIds ?? [];
                  const hasValues = levelOptions.length > 0;
                  const shouldLockLevel = hasValues;
                  const isLevelsLoading = Boolean(
                    selectedLibrary &&
                    isLoadingAttributeDetails &&
                    attributeByKey[selectedLibrary] === undefined
                  );

                  return (
                    <Collapsible
                      key={field.id}
                      defaultOpen
                      className="w-full rounded-none border-b border-b-[rgba(217,217,217,1)] pt-3.5"
                    >
                      <div className="flex w-full justify-between gap-2.25 pr-10 pb-6 pl-2.5">
                        <CollapsibleTrigger
                          className="group flex items-center gap-1.5"
                          type="button"
                        >
                          <ChevronDownIcon className="size-5 transition-transform group-data-panel-open:rotate-90" />
                          <p className="text-start text-xs leading-3.5 font-semibold text-[rgba(87,87,87,1)]">
                            {`Հատկանիշ ${index + 1}`}
                          </p>
                        </CollapsibleTrigger>
                        {!isEdit && fields.length > 1 && (
                          <button
                            type="button"
                            className="text-[12px] font-medium text-[rgba(204,0,0,1)] hover:underline"
                            onClick={() => remove(index)}
                          >
                            Հեռացնել
                          </button>
                        )}
                      </div>
                      <CollapsibleContent className="flex w-full flex-col gap-4 border-t border-t-[rgba(217,217,217,1)] bg-[rgba(217,217,217,0.1)] px-10 py-4.25">
                        <FormField
                          control={control}
                          name={`rows.${index}.category`}
                          render={({ field: f }) => (
                            <FormItem className="w-full">
                              <FormLabel className="text-[12px] leading-3.5 font-semibold text-[rgba(87,87,87,1)]">
                                Ընտրել Տեսակը
                              </FormLabel>
                              <Select
                                value={f.value || undefined}
                                onValueChange={(val) => {
                                  f.onChange(val);
                                  setValue(`rows.${index}.libraryOption`, "");
                                  setValue(`rows.${index}.levelOption`, "");
                                  setValue(`rows.${index}.valueIds`, []);
                                }}
                                disabled={isLoading || !attributesCategories.length}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Ընտրել" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    {attributesCategories.map((c) => (
                                      <SelectItem key={c.value} value={c.value}>
                                        {c.title.hy}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`rows.${index}.libraryOption`}
                          render={({ field: f }) => (
                            <FormItem className="w-full">
                              <FormLabel className="text-[12px] leading-3.5 font-semibold text-[rgba(87,87,87,1)]">
                                Գրադարան
                              </FormLabel>
                              <Select
                                value={f.value || undefined}
                                onValueChange={(val) => {
                                  f.onChange(val);
                                  setValue(`rows.${index}.levelOption`, "");
                                  setValue(`rows.${index}.valueIds`, []);
                                }}
                                disabled={
                                  isLoading || !selectedCategory || libraryOptions.length === 0
                                }
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Ընտրել" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    {libraryOptions.map((opt) => (
                                      <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`rows.${index}.levelOption`}
                          render={({ field: f }) => (
                            <FormItem className="w-full">
                              <FormLabel className="text-[12px] leading-3.5 font-semibold text-[rgba(87,87,87,1)]">
                                Ընտրել Մակարդակ
                              </FormLabel>
                              <Select
                                value={f.value || undefined}
                                onValueChange={f.onChange}
                                disabled={
                                  isLoading ||
                                  !selectedLibrary ||
                                  isLevelsLoading ||
                                  shouldLockLevel
                                }
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue
                                      placeholder={isLevelsLoading ? "Բեռնում…" : "Ընտրել"}
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    {LEVEL_OPTIONS.map((level) => (
                                      <SelectItem key={level.value} value={level.value}>
                                        {level.label}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              {shouldLockLevel && (
                                <p className="text-[11px] text-zinc-500">
                                  Մակարդակը ֆիքսված է՝ «Հիմնական», քանի որ առկա են արժեքներ։
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`rows.${index}.valueIds`}
                          render={({ field: f }) => {
                            const totalOptions = levelOptions.length;
                            const selectedCount = selectedValueIds.length;
                            const allSelected = totalOptions > 0 && selectedCount === totalOptions;
                            const triggerLabel =
                              selectedCount > 0 ? `Ընտրված է ${selectedCount}` : "Ընտրել";

                            return (
                              <FormItem className="w-full">
                                <FormLabel className="text-[12px] leading-3.5 font-semibold text-[rgba(87,87,87,1)]">
                                  Գրադարան Արժեքներ
                                </FormLabel>
                                <Popover
                                  open={Boolean(valuesPopoverOpenByRow[index])}
                                  onOpenChange={(open) =>
                                    setValuesPopoverOpenByRow((prev) => ({
                                      ...prev,
                                      [index]: open,
                                    }))
                                  }
                                >
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <button
                                        type="button"
                                        disabled={
                                          isLoading ||
                                          !selectedLibrary ||
                                          isLevelsLoading ||
                                          levelOptions.length === 0
                                        }
                                        className={cn(
                                          "border-input flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-left text-sm",
                                          "disabled:cursor-not-allowed disabled:opacity-50"
                                        )}
                                      >
                                        <span
                                          className={cn(
                                            "truncate",
                                            selectedCount === 0 && "text-muted-foreground"
                                          )}
                                        >
                                          {triggerLabel}
                                        </span>
                                        <ChevronDownIcon className="size-4 opacity-50" />
                                      </button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                    <div className="flex items-center justify-between border-b px-3 py-2">
                                      <FieldLabel className="text-xs font-medium text-zinc-700">
                                        Գրադարան Արժեքներ
                                      </FieldLabel>
                                      <button
                                        type="button"
                                        className="text-xs font-medium text-[rgba(39,81,153,1)] hover:underline"
                                        onClick={() => {
                                          if (allSelected) {
                                            f.onChange([]);
                                            return;
                                          }
                                          f.onChange(levelOptions.map((opt) => opt._id));
                                        }}
                                      >
                                        Ընտրել բոլորը
                                      </button>
                                    </div>
                                    <div className="max-h-56 space-y-2 overflow-y-auto px-3 py-2">
                                      {levelOptions.map((opt) => {
                                        const checked = selectedValueIds.includes(opt._id);
                                        return (
                                          <label
                                            key={opt._id}
                                            className="flex cursor-pointer items-center gap-2 text-sm"
                                          >
                                            <Checkbox
                                              checked={checked}
                                              onCheckedChange={(next) => {
                                                if (next) {
                                                  f.onChange([...selectedValueIds, opt._id]);
                                                  return;
                                                }
                                                f.onChange(
                                                  selectedValueIds.filter((id) => id !== opt._id)
                                                );
                                              }}
                                            />
                                            <span>{opt.title.hy}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
              {!isEdit && (
                <div className="w-full px-10 py-9">
                  <button
                    type="button"
                    onClick={() => append(emptyIndicatorFeatureRow())}
                    className="flex cursor-pointer items-center gap-3.25 self-center"
                  >
                    <Image src="/add.svg" width={24} height={24} alt="" />
                    <span className="text-[14px] leading-3.5 font-medium text-[rgba(39,81,153,1)]">
                      Ավելացնել հատկանիշ
                    </span>
                  </button>
                </div>
              )}
            </div>
            <DialogFooter className="border-none bg-white">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-[8px] bg-white px-10 text-[13px] leading-3.5 font-semibold text-[rgba(44,44,44,1)]"
                onClick={() => setDialogOpen(false)}
              >
                Չեղարկել
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 rounded-[8px] border-transparent bg-[#004d99] px-10 text-[13px] leading-3.5 font-semibold text-white hover:bg-[#004d99]/90 hover:text-white"
              >
                {isEdit ? "Թարմացնել" : "Պահպանել"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
