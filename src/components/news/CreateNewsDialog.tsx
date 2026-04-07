"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type LangCode = "am" | "ru" | "en";
type LocalizedText = Record<LangCode, string>;

const createNewsSchema = z
  .object({
    title: z.object({
      am: z.string().trim(),
      ru: z.string().trim(),
      en: z.string().trim(),
    }),
    content: z.object({
      am: z.string().trim(),
      ru: z.string().trim(),
      en: z.string().trim(),
    }),
    link: z
      .string()
      .trim()
      .min(1, "Լրացրեք հղումը")
      .url("Մուտքագրեք ճիշտ հղում (URL)"),
    publishedAt: z.string().trim().min(1, "Լրացրեք հրապարակման ամսաթիվը"),
  })
  .superRefine((values, ctx) => {
    const hasAnyTitle = Boolean(values.title.am || values.title.ru || values.title.en);
    const hasAnyContent = Boolean(values.content.am || values.content.ru || values.content.en);

    if (!hasAnyTitle) {
      (["am", "ru", "en"] as const).forEach((lang) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["title", lang],
          message: "Լրացրեք վերնագիրը առնվազն մեկ լեզվով",
        });
      });
    }

    if (!hasAnyContent) {
      (["am", "ru", "en"] as const).forEach((lang) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["content", lang],
          message: "Լրացրեք բովանդակությունը առնվազն մեկ լեզվով",
        });
      });
    }
  });

export type CreateNewsFormValues = z.infer<typeof createNewsSchema>;

type CreateNewsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitNews: (values: CreateNewsFormValues) => Promise<void> | void;
};

const defaultLocalized: LocalizedText = { am: "", ru: "", en: "" };

const fieldLabels: Record<LangCode, { title: string; content: string }> = {
  am: { title: "Վերնագիր", content: "Բովանդակություն" },
  ru: { title: "Заголовок", content: "Содержание" },
  en: { title: "Title", content: "Content" },
};

const fieldPlaceholders: Record<LangCode, { title: string; content: string }> = {
  am: { title: "Մուտքագրել վերնագիրը", content: "Մուտքագրել բովանդակությունը" },
  ru: { title: "Введите заголовок", content: "Введите содержание" },
  en: { title: "Enter title", content: "Enter content" },
};

export function CreateNewsDialog({ open, onOpenChange, onSubmitNews }: CreateNewsDialogProps) {
  const [activeLang, setActiveLang] = useState<LangCode>("am");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateNewsFormValues>({
    resolver: zodResolver(createNewsSchema),
    defaultValues: {
      title: defaultLocalized,
      content: defaultLocalized,
      link: "",
      publishedAt: "",
    },
  });

  useEffect(() => {
    if (!open) {
      setActiveLang("am");
      form.reset({
        title: defaultLocalized,
        content: defaultLocalized,
        link: "",
        publishedAt: "",
      });
    }
  }, [open, form]);

  const handleSubmit = async (values: CreateNewsFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmitNews(values);
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
          <DialogTitle className="text-[18px] leading-3.5 font-semibold text-[#2c2c2c]">
            Ստեղծել նորություն
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="px-6 pt-4 pb-5">
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

              <TabsContent value={activeLang} className="mt-4 flex w-full flex-col gap-4">
                <FormField
                  control={form.control}
                  name={`title.${activeLang}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px] font-semibold text-[#575757]">
                        {fieldLabels[activeLang].title}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={fieldPlaceholders[activeLang].title}
                          className="h-9 rounded-[9px] border-[#e6e7eb] bg-white px-3 text-[13px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`content.${activeLang}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px] font-semibold text-[#575757]">
                        {fieldLabels[activeLang].content}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={fieldPlaceholders[activeLang].content}
                          className="min-h-[96px] rounded-[9px] border-[#e6e7eb] bg-white px-3 py-2 text-[13px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="mt-5 flex flex-col gap-4">
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px] font-semibold text-[#575757]">
                      Հղում
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://example.com/news"
                        className="h-9 rounded-[9px] border-[#e6e7eb] bg-white px-3 text-[13px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publishedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px] font-semibold text-[#575757]">
                      Հրապարակվել է
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        className="h-9 rounded-[9px] border-[#e6e7eb] bg-white px-3 text-[13px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-8 border-none bg-white">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-11 w-[140px] rounded-[8px] border-[#e0e0e0] bg-white text-[13px] font-semibold text-[#2c2c2c] hover:bg-[#f8f8f8]"
              >
                Չեղարկել
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
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
