"use client";

import React, { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Loader2, Trash2 } from "lucide-react";
import useSWR, { useSWRConfig } from "swr";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LangSwitcher } from "@/components/main/LangSwitcher";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { swrKeys } from "@/lib/swr/cache-keys";
import { withToastError } from "@/lib/withToastError";
import {
  getTopicById,
  getTopicSubtopics,
  updateSection,
  updateTopic,
  upsertTopic,
} from "@/services/sectionsService";
import type { Topic } from "@/types/section";
import Image from "next/image";

type LangCode = "hy" | "ru" | "en";
type LocalizedField = Record<LangCode, string>;

const schema = z
  .object({
    title: z.object({
      hy: z.string().trim(),
      ru: z.string().trim(),
      en: z.string().trim(),
    }),
    body: z.object({
      hy: z.string().trim(),
      ru: z.string().trim(),
      en: z.string().trim(),
    }),
    nestedSubgroups: z.array(
      z.object({
        title: z.object({
          hy: z.string().trim(),
          ru: z.string().trim(),
          en: z.string().trim(),
        }),
        body: z.object({
          hy: z.string().trim(),
          ru: z.string().trim(),
          en: z.string().trim(),
        }),
      })
    ),
  })
  .superRefine((values, ctx) => {
    const hasTitle = Boolean(values.title.hy || values.title.ru || values.title.en);
    if (!hasTitle) {
      (["hy", "ru", "en"] as const).forEach((lang) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["title", lang],
          message: "Լրացրեք անվանումը առնվազն մեկ լեզվով",
        });
      });
    }
  });

type FormValues = z.infer<typeof schema>;

type EditSubgroupDialogProps = {
  open: boolean;
  headingTopic: boolean;
  onOpenChange: (open: boolean) => void;
  topic: Topic;
  siblingTopics: Topic[];
};

export function EditSubgroupDialog({
  open,
  onOpenChange,
  topic,
  siblingTopics,
  headingTopic,
}: EditSubgroupDialogProps) {
  const [activeLang, setActiveLang] = useState<LangCode>("hy");
  const [addDialogActiveLang, setAddDialogActiveLang] = useState<LangCode>("hy");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addDialogError, setAddDialogError] = useState<string | null>(null);
  const [isAddSubmitting, setIsAddSubmitting] = useState(false);
  const [newNestedSubgroup, setNewNestedSubgroup] = useState<{
    title: LocalizedField;
    body: LocalizedField;
  }>({
    title: { hy: "", ru: "", en: "" },
    body: { hy: "", ru: "", en: "" },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate } = useSWRConfig();

  const fallbackChildTopics = useMemo(
    () => siblingTopics.filter((t) => t.parentTopicId === topic._id),
    [siblingTopics, topic._id]
  );
  const { data: fetchedTopic, isLoading: isTopicLoading } = useSWR(
    open && !headingTopic ? ["topic", topic._id] : null,
    () => getTopicById(topic._id)
  );
  const { data: fetchedSubtopics, isLoading: isSubtopicsLoading } = useSWR(
    open && !headingTopic ? ["topic-subtopics", topic._id] : null,
    () => getTopicSubtopics(topic._id)
  );
  const sourceTopic = fetchedTopic ?? topic;

  const childTopics = (fetchedSubtopics ?? fallbackChildTopics).slice();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: { hy: topic.title.hy ?? "", ru: topic.title.ru ?? "", en: topic.title.en ?? "" },
      body: { hy: topic.body?.hy ?? "", ru: topic.body?.ru ?? "", en: topic.body?.en ?? "" },
      nestedSubgroups: childTopics.map((t) => ({
        title: { hy: t.title.hy ?? "", ru: t.title.ru ?? "", en: t.title.en ?? "" },
        body: { hy: t.body?.hy ?? "", ru: t.body?.ru ?? "", en: t.body?.en ?? "" },
      })),
    },
  });

  const { fields, remove } = useFieldArray({
    control: form.control,
    name: "nestedSubgroups",
  });

  const pickLocalized = (value: LocalizedField): string =>
    value.hy.trim() || value.ru.trim() || value.en.trim() || "";

  const addDialogTitle = headingTopic ? "Ավելացնել Ենթաթեմա" : "Ավելացնել Ենթա-ենթեմա";

  const resetAddDialogState = () => {
    setAddDialogActiveLang("hy");
    setAddDialogError(null);
    setNewNestedSubgroup({
      title: { hy: "", ru: "", en: "" },
      body: { hy: "", ru: "", en: "" },
    });
  };

  const handleOpenAddDialog = () => {
    resetAddDialogState();
    setIsAddDialogOpen(true);
  };

  const handleAddDialogOpenChange = (openState: boolean) => {
    setIsAddDialogOpen(openState);
    if (!openState) {
      resetAddDialogState();
    }
  };

  const handleAddNestedSubgroup = async () => {
    const hasTitle = Boolean(
      newNestedSubgroup.title.hy.trim() ||
      newNestedSubgroup.title.ru.trim() ||
      newNestedSubgroup.title.en.trim()
    );
    if (!hasTitle) {
      setAddDialogError("Լրացրեք անվանումը առնվազն մեկ լեզվով");
      return;
    }

    const sectionId = sourceTopic.sectionId ?? topic.sectionId;
    if (!sectionId) return;

    setIsAddSubmitting(true);
    try {
      const createPayload = headingTopic
        ? {
            sectionId,
            title: newNestedSubgroup.title,
            body: newNestedSubgroup.body,
            order: childTopics.length,
          }
        : {
            sectionId,
            parentTopicId: sourceTopic._id,
            title: newNestedSubgroup.title,
            body: newNestedSubgroup.body,
            order: childTopics.length,
          };

      const created = await withToastError(
        () => upsertTopic(createPayload),
        { title: "Ենթաթեման ստեղծվել է" }
      );
      if (!created) return;

      await mutate(swrKeys.sections);
      handleAddDialogOpenChange(false);
    } finally {
      setIsAddSubmitting(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    const sectionId = sourceTopic.sectionId ?? topic.sectionId;
    if (!sectionId) return;

    const normalizedChildren = values.nestedSubgroups
      .map((child) => ({
        title: { hy: child.title.hy.trim(), ru: child.title.ru.trim(), en: child.title.en.trim() },
        body: { hy: child.body.hy.trim(), ru: child.body.ru.trim(), en: child.body.en.trim() },
      }))
      .filter((child) => child.title.hy || child.title.ru || child.title.en);
    setIsSubmitting(true);
    try {
      const existingTitles = new Set(
        childTopics.map((t) => t.title.hy.trim().toLowerCase())
      );
      const childToCreate = normalizedChildren.filter(
        (child) => !existingTitles.has(child.title.hy.toLowerCase())
      );

      const sectionIdForHeading = topic.sectionId ?? topic._id;

      const result = await withToastError(
        async () => {
          if (headingTopic) {
            await updateSection(sectionIdForHeading, {
              name: values.title,
              description: values.body,
            });
          } else {
            await updateTopic(sourceTopic._id, {
              title: values.title,
              body: values.body,
            });
          }

          await Promise.all(
            childToCreate.map((child, idx) =>
              upsertTopic({
                sectionId,
                ...(headingTopic
                  ? {}
                  : { parentTopicId: sourceTopic._id }),
                title: child.title,
                body: child.body,
                order: childTopics.length + idx,
              })
            )
          );

          return true;
        },
        { title: "Ենթախումբը թարմացվել է" }
      );

      if (!result) return;
      await mutate(swrKeys.sections);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="w-[587px] max-w-[587px] min-w-[587px] gap-0 rounded-[20px] p-0"
        >
          <DialogHeader className="px-6 py-5">
            <DialogTitle className="text-[18px] leading-3.5 font-semibold text-[rgba(44,44,44,1)]">
              Խմբագրել ենթախումբ
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 mb-5 px-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="h-full pb-5">
                <Tabs value={activeLang} className="w-full gap-5">
                  <LangSwitcher
                    value={activeLang}
                    onChange={setActiveLang}
                    className="w-full [&_button]:min-w-0 [&_button]:flex-1"
                  />
                  {(["hy", "ru", "en"] as const).map((lang) => (
                    <TabsContent
                      key={lang}
                      value={lang}
                      forceMount
                      className="data-[state=inactive]:hidden"
                    >
                      <div className="no-scrollbar flex h-full max-h-[60vh] flex-col gap-4 overflow-y-auto pt-6">
                        <FormField
                          control={form.control}
                          name={`title.${lang}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[12px] font-semibold text-[#575757]">
                                Ենթախմբի անվանում
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="h-9 rounded-[9px] border-[#e6e7eb] text-[13px]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`body.${lang}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[12px] font-semibold text-[#575757]">
                                Նկարագրություն
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  className="min-h-[78px] rounded-[9px] border-[#e6e7eb] px-3 py-2 text-[13px]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex flex-col justify-start gap-4">
                          <div className="flex flex-col gap-3 bg-[rgba(230,231,235,0.3)]">
                            {fields.map((field, index) => (
                              <div key={field.id} className="flex items-center gap-2 border-b p-3">
                                <div className={"flex w-full flex-col gap-2"}>
                                  <FormField
                                    control={form.control}
                                    name={`nestedSubgroups.${index}.title.${lang}`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-[12px] font-semibold text-[#575757]">
                                          Ենթաթեմայի անվանումը
                                        </FormLabel>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            className="h-9 rounded-[9px] border-[#e6e7eb] text-[13px]"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name={`nestedSubgroups.${index}.body.${lang}`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-[12px] font-semibold text-[#575757]">
                                          Ենթաթեմայի Նկարագրություն
                                        </FormLabel>
                                        <FormControl>
                                          <Textarea
                                            {...field}
                                            className="min-h-[78px] rounded-[9px] border-[#e6e7eb] px-3 py-2 text-[13px]"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="h-9 w-9 rounded-[9px] text-[#c00] hover:bg-[#ffecec]"
                                  onClick={() => remove(index)}
                                  aria-label="Remove subgroup"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            className="flex cursor-pointer items-center gap-3.25"
                            onClick={handleOpenAddDialog}
                          >
                            <Image src="/add.svg" width={24} height={24} alt={"add"} />
                            <span className="text-[14px] leading-3.5 font-medium text-[rgba(39,81,153,1)]">
                              Ավելացնել ենթախումբ
                            </span>
                          </button>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                <DialogFooter className="mt-8 border-none bg-white">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-[140px] rounded-[8px] border-[#e0e0e0] text-[13px] font-semibold text-[#2c2c2c]"
                    onClick={() => onOpenChange(false)}
                  >
                    Չեղարկել
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isTopicLoading || isSubtopicsLoading}
                    className="h-11 w-[141px] rounded-[8px] border-0 bg-[#275199] text-[13px] font-semibold text-white hover:bg-[#234a8b]"
                  >
                    {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Պահպանել"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={handleAddDialogOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="w-[587px] max-w-[587px] min-w-[587px] gap-0 rounded-[20px] p-0"
        >
          <DialogHeader className="px-6 py-5">
            <DialogTitle className="text-[18px] leading-3.5 font-semibold text-[rgba(44,44,44,1)]">
              {addDialogTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 mb-5 px-6">
            <Tabs value={addDialogActiveLang} className="w-full gap-5">
              <LangSwitcher
                value={addDialogActiveLang}
                onChange={setAddDialogActiveLang}
                className="w-full [&_button]:min-w-0 [&_button]:flex-1"
              />
              {(["hy", "ru", "en"] as const).map((lang) => (
                <TabsContent
                  key={lang}
                  value={lang}
                  forceMount
                  className="data-[state=inactive]:hidden"
                >
                  <div className="flex flex-col gap-4 pt-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-[#575757]">Անվանում</label>
                      <Input
                        value={newNestedSubgroup.title[lang]}
                        onChange={(event) => {
                          const next = event.target.value;
                          setAddDialogError(null);
                          setNewNestedSubgroup((current) => ({
                            ...current,
                            title: {
                              ...current.title,
                              [lang]: next,
                            },
                          }));
                        }}
                        className="h-9 rounded-[9px] border-[#e6e7eb] text-[13px]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-[#575757]">
                        Նկարագրություն
                      </label>
                      <Textarea
                        value={newNestedSubgroup.body[lang]}
                        onChange={(event) => {
                          const next = event.target.value;
                          setNewNestedSubgroup((current) => ({
                            ...current,
                            body: {
                              ...current.body,
                              [lang]: next,
                            },
                          }));
                        }}
                        className="min-h-[78px] rounded-[9px] border-[#e6e7eb] px-3 py-2 text-[13px]"
                      />
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {addDialogError ? (
              <p className="mt-2 text-[12px] font-medium text-[#c00]">{addDialogError}</p>
            ) : null}

            <DialogFooter className="mt-8 border-none bg-white">
              <Button
                type="button"
                variant="outline"
                className="h-11 w-[140px] rounded-[8px] border-[#e0e0e0] text-[13px] font-semibold text-[#2c2c2c]"
                onClick={() => handleAddDialogOpenChange(false)}
              >
                Չեղարկել
              </Button>
              <Button
                type="button"
                onClick={handleAddNestedSubgroup}
                disabled={isAddSubmitting}
                className="h-11 w-[141px] rounded-[8px] border-0 bg-[#275199] text-[13px] font-semibold text-white hover:bg-[#234a8b]"
              >
                {isAddSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Պահպանել"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
