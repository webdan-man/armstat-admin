"use client";

import React, { useEffect, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
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
import { fetchAttributes } from "@/services/attributeService";
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
  parseLibraryOption,
} from "@/components/indicators/indicator-feature-form-schema";

export default function CreateWindow() {
  const { features, dialogOpen, editingId, setDialogOpen, startCreate, addFeature, updateFeature } =
    useIndicatorFeatures();

  const { data: attributes, isLoading } = useSWR(swrKeys.attributes, fetchAttributes);

  const categories = useMemo(() => {
    if (!attributes?.length) return [];
    const set = new Set(attributes.map((a) => a.category).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [attributes]);

  const editing = editingId ? features.find((f) => f.id === editingId) : undefined;
  const isEdit = Boolean(editingId && editing);

  const form = useForm<IndicatorFeaturesBatchFormValues>({
    resolver: zodResolver(indicatorFeaturesBatchFormSchema),
    defaultValues: {
      rows: [emptyIndicatorFeatureRow()],
    },
  });

  const { control, handleSubmit, reset, setValue } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rows",
  });

  const rowsWatch = useWatch({ control, name: "rows" });

  useEffect(() => {
    if (!dialogOpen) return;
    if (editing) {
      reset({
        rows: [
          {
            name: editing.name,
            category: editing.category,
            libraryOption: `${editing.attributeKey}:${editing.valueKey}`,
          },
        ],
      });
    } else {
      reset({
        rows: [emptyIndicatorFeatureRow()],
      });
    }
  }, [dialogOpen, editingId, editing, reset]);

  const onSubmit = (values: IndicatorFeaturesBatchFormValues) => {
    if (!attributes?.length) return;
    if (isEdit && editing) {
      const row = values.rows[0];
      const parsed = parseLibraryOption(row.libraryOption);
      if (!parsed) return;
      const libraryDisplay = buildLibraryDisplay(attributes, parsed.attributeKey, parsed.valueKey);
      updateFeature(editing.id, {
        name: row.name.trim(),
        category: row.category,
        attributeKey: parsed.attributeKey,
        valueKey: parsed.valueKey,
        libraryDisplay,
      });
    } else {
      for (const row of values.rows) {
        const parsed = parseLibraryOption(row.libraryOption);
        if (!parsed) continue;
        const libraryDisplay = buildLibraryDisplay(
          attributes,
          parsed.attributeKey,
          parsed.valueKey
        );
        addFeature({
          name: row.name.trim(),
          category: row.category,
          attributeKey: parsed.attributeKey,
          valueKey: parsed.valueKey,
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
                  const libraryOptions = buildLibraryOptions(attributes, selectedCategory);

                  return (
                    <Collapsible
                      key={field.id}
                      defaultOpen
                      className="w-full rounded-none border-b border-b-[rgba(217,217,217,1)] pt-3.5"
                    >
                      <div className="flex w-full items-end gap-2.25 pr-10 pb-6 pl-2.5">
                        <CollapsibleTrigger className="group mb-1.25" type="button">
                          <ChevronDownIcon className="size-5 transition-transform group-data-[state=open]:rotate-90" />
                        </CollapsibleTrigger>
                        <div className="flex w-full flex-col items-start gap-1.75">
                          <div className="flex w-full items-center justify-between gap-2">
                            <p className="text-start text-xs leading-3.5 font-semibold text-[rgba(87,87,87,1)]">
                              {`Հատկանիշ ${index + 1}`}
                            </p>
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
                          <FormField
                            control={control}
                            name={`rows.${index}.name`}
                            render={({ field: f }) => (
                              <FormItem className="w-full">
                                <FormControl>
                                  <Input
                                    {...f}
                                    className="rounded-[9px] border border-[rgba(230,231,235,1)]"
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
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
                                }}
                                disabled={isLoading || !categories.length}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Ընտրել" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    {categories.map((c) => (
                                      <SelectItem key={c} value={c}>
                                        {c}
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
                                onValueChange={f.onChange}
                                disabled={
                                  isLoading || !selectedCategory || libraryOptions.length === 0
                                }
                              >
                                <FormControl>
                                  <SelectTrigger>
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
                        <Field className="w-full">
                          <FieldLabel className="text-[12px] leading-3.5 font-semibold text-[rgba(87,87,87,1)]">
                            Ընտրել Մակարդակ
                          </FieldLabel>
                          <Select disabled>
                            <SelectTrigger>
                              <SelectValue placeholder="Ընտրել" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="_">—</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field className="w-full">
                          <FieldLabel className="text-[12px] leading-3.5 font-semibold text-[rgba(87,87,87,1)]">
                            Գրադարան Արժեքներ
                          </FieldLabel>
                          <Select disabled>
                            <SelectTrigger>
                              <SelectValue placeholder="Ընտրել" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="__">—</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </Field>
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
