"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import useSWR, { useSWRConfig } from "swr";
import { Loader2 } from "lucide-react";
import z from "zod";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { swrKeys } from "@/lib/swr/cache-keys";
import { withToastError } from "@/lib/withToastError";
import { createSection, fetchSections } from "@/services/sectionsService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LangCode = "am" | "ru" | "en";
type LocalizedField = Record<LangCode, string>;

const createSectionSchema = z
  .object({
    name: z.object({
      am: z.string().trim(),
      ru: z.string().trim(),
      en: z.string().trim(),
    }),
    description: z.object({
      am: z.string().trim(),
      ru: z.string().trim(),
      en: z.string().trim(),
    }),
  })
  .superRefine((values, ctx) => {
    const hasName = Boolean(values.name.am || values.name.ru || values.name.en);
    const hasDescription = Boolean(
      values.description.am || values.description.ru || values.description.en
    );

    if (!hasName) {
      (["am", "ru", "en"] as const).forEach((lang) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["name", lang],
          message: "Լրացրեք անվանումը առնվազն մեկ լեզվով",
        });
      });
    }

    if (!hasDescription) {
      (["am", "ru", "en"] as const).forEach((lang) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["description", lang],
          message: "Լրացրեք նկարագրությունը առնվազն մեկ լեզվով",
        });
      });
    }
  });

type CreateSectionFormValues = z.infer<typeof createSectionSchema>;

type CreateSectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateSectionDialog({ open, onOpenChange }: CreateSectionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLang, setActiveLang] = useState<LangCode>("am");
  const { mutate } = useSWRConfig();
  const { isLoading: isSectionsLoading } = useSWR(swrKeys.sections, fetchSections);

  const form = useForm<CreateSectionFormValues>({
    resolver: zodResolver(createSectionSchema),
    defaultValues: {
      name: { am: "", ru: "", en: "" },
      description: { am: "", ru: "", en: "" },
    },
  });

  const handleClose = () => {
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) {
      setActiveLang("am");
      form.reset({
        name: { am: "", ru: "", en: "" },
        description: { am: "", ru: "", en: "" },
      });
    }
  }, [open, form]);

  const fieldLabels: Record<LangCode, { name: string; description: string }> = {
    am: { name: "Անվանում", description: "Նկարագրություն" },
    ru: { name: "Название", description: "Описание" },
    en: { name: "Name", description: "Description" },
  };

  const fieldPlaceholders: Record<LangCode, { name: string; description: string }> = {
    am: { name: "Մուտքագրել անվանումը", description: "Մուտքագրել նկարագրությունը" },
    ru: { name: "Введите название", description: "Введите описание" },
    en: { name: "Enter name", description: "Enter description" },
  };

  const payloadFor = (value: LocalizedField): LocalizedField => ({
    am: value.am.trim(),
    ru: value.ru.trim(),
    en: value.en.trim(),
  });

  const onSubmit = async (values: CreateSectionFormValues) => {
    setIsSubmitting(true);
    try {
      const created = await withToastError(
        () =>
          createSection({
            name: payloadFor(values.name),
            description: payloadFor(values.description),
          }),
        {
          title: "Բաժինը ստեղծվել է հաջողությամբ",
        }
      );

      if (!created) return;

      await mutate(swrKeys.sections);
      setActiveLang("am");
      form.reset({
        name: { am: "", ru: "", en: "" },
        description: { am: "", ru: "", en: "" },
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[587px] max-w-[587px] min-w-[587px] gap-0 rounded-[20px] p-0"
      >
        <DialogHeader className="px-6 py-5">
          <DialogTitle className="text-[18px] leading-3.5 font-semibold text-[rgba(44,44,44,1)]">
            Ավելացնել Բաժին
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pt-6 pb-5">
            <Tabs
              value={activeLang}
              onValueChange={(value) => setActiveLang(value as LangCode)}
              className="w-full gap-5"
            >
              <TabsList className="h-9 w-full gap-0 rounded-[9px] bg-[#e6e7eb] p-0.5">
                <TabsTrigger
                  value="en"
                  className="h-full rounded-[8px] px-5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  EN
                </TabsTrigger>
                <TabsTrigger
                  value="am"
                  className="h-full rounded-[8px] px-5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  HY
                </TabsTrigger>
                <TabsTrigger
                  value="ru"
                  className="h-full rounded-[8px] px-5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  RU
                </TabsTrigger>
              </TabsList>
              <TabsContent className="flex w-full flex-col gap-9.25" value={activeLang}>
                <div className="flex flex-col gap-5">
                  <FormField
                    control={form.control}
                    name={`name.${activeLang}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[12px] font-semibold text-[#575757]">
                          {fieldLabels[activeLang].name}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={fieldPlaceholders[activeLang].name}
                            className="h-9 rounded-[9px] border-[#e6e7eb] bg-white px-3 text-[13px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`description.${activeLang}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[12px] font-semibold text-[#575757]">
                          {fieldLabels[activeLang].description}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={fieldPlaceholders[activeLang].description}
                            className="min-h-24 rounded-[9px] border-[#e6e7eb] bg-white px-3 py-2 text-[13px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-10 border-none bg-white">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="h-11 w-[140px] rounded-[8px] border-[#e0e0e0] bg-white text-[13px] font-semibold text-[#2c2c2c] hover:bg-[#f8f8f8]"
              >
                Չեղարկել
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isSectionsLoading}
                className="h-11 w-[141px] rounded-[8px] border-0 bg-[#275199] text-[13px] font-semibold text-white hover:bg-[#234a8b]"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Պահպանել"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
