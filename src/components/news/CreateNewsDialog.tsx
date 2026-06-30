"use client";

import React, { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { DateFieldInput } from "@/components/ui/date-field-input";
import { Input } from "@/components/ui/input";
import { parseDotDisplayDate } from "@/lib/format-display-date";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export type LangCode = "hy" | "ru" | "en";
type LocalizedText = Record<LangCode, string>;

const locales: LangCode[] = ["en", "hy", "ru"];
const emptyLocalized = (): LocalizedText => ({ hy: "", ru: "", en: "" });

const createNewsSchema = z
  .object({
    title: z.object({
      hy: z.string().trim(),
      ru: z.string().trim(),
      en: z.string().trim(),
    }),
    content: z.object({
      hy: z.string().trim(),
      ru: z.string().trim(),
      en: z.string().trim(),
    }),
    publishedAt: z
      .string()
      .trim()
      .min(1, "Լրացրեք հրապարակման ամսաթիվը")
      .refine(
        (value) => parseDotDisplayDate(value) !== null,
        "Մուտքագրեք ամսաթիվը dd.mm.yyyy ձևաչափով"
      ),
  })
  .superRefine((values, ctx) => {
    const hasAnyTitle = Boolean(values.title.hy || values.title.ru || values.title.en);
    const hasAnyContent = Boolean(values.content.hy || values.content.ru || values.content.en);

    if (!hasAnyTitle) {
      (["hy", "ru", "en"] as const).forEach((lang) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["title", lang],
          message: "Լրացրեք վերնագիրը առնվազն մեկ լեզվով",
        });
      });
    }

    if (!hasAnyContent) {
      (["hy", "ru", "en"] as const).forEach((lang) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["content", lang],
          message: "Լրացրեք բովանդակությունը առնվազն մեկ լեզվով",
        });
      });
    }
  });

export type CreateNewsFormValues = z.infer<typeof createNewsSchema>;

export type NewsDialogMode = "create" | "edit";

export type NewsImageSubmitInfo = {
  /** New file selected by the user (null if image was untouched or removed). */
  file: File | null;
  /** True when the user explicitly removed an existing image. */
  removed: boolean;
};

type CreateNewsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitNews: (
    values: CreateNewsFormValues,
    image: NewsImageSubmitInfo
  ) => Promise<void> | void;
  mode?: NewsDialogMode;
  initialValues?: CreateNewsFormValues;
  initialImageUrl?: string;
};

const defaultFormValues: CreateNewsFormValues = {
  title: emptyLocalized(),
  content: emptyLocalized(),
  publishedAt: "",
};

function cloneFormValues(values: CreateNewsFormValues): CreateNewsFormValues {
  return {
    title: { ...values.title },
    content: { ...values.content },
    publishedAt: values.publishedAt,
  };
}

const fieldLabels: Record<LangCode, { title: string; content: string }> = {
  hy: { title: "Վերնագիր", content: "Բովանդակություն" },
  ru: { title: "Заголовок", content: "Содержание" },
  en: { title: "Title", content: "Content" },
};

const fieldPlaceholders: Record<LangCode, { title: string; content: string }> = {
  hy: { title: "Մուտքագրել վերնագիրը", content: "Մուտքագրել բովանդակությունը" },
  ru: { title: "Введите заголовок", content: "Введите содержание" },
  en: { title: "Enter title", content: "Enter content" },
};

function resolveImageSrc(value: string): string {
  if (!value) return "";
  if (value.startsWith("blob:") || value.startsWith("data:")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  return `${base}${value.startsWith("/") ? "" : "/"}${value}`;
}

export function CreateNewsDialog({
  open,
  onOpenChange,
  onSubmitNews,
  mode = "create",
  initialValues,
  initialImageUrl,
}: CreateNewsDialogProps) {
  const [activeLang, setActiveLang] = useState<LangCode>("hy");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageDirty, setImageDirty] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const form = useForm<CreateNewsFormValues>({
    resolver: zodResolver(createNewsSchema),
    defaultValues: defaultFormValues,
  });

  const releaseBlobUrl = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  useEffect(() => {
    setActiveLang("hy");
    setImageFile(null);
    setImageDirty(false);
    releaseBlobUrl();
    if (open) {
      form.reset(cloneFormValues(initialValues ?? defaultFormValues));
      setImagePreview(initialImageUrl ?? "");
    } else {
      form.reset(cloneFormValues(defaultFormValues));
      setImagePreview("");
    }
  }, [open, initialValues, initialImageUrl, form]);

  useEffect(() => {
    return () => {
      releaseBlobUrl();
    };
  }, []);

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Խնդրում ենք ընտրել նկարի ֆայլ։");
      return;
    }
    releaseBlobUrl();
    const previewUrl = URL.createObjectURL(file);
    blobUrlRef.current = previewUrl;
    setImageFile(file);
    setImagePreview(previewUrl);
    setImageDirty(true);
  };

  const handleRemoveImage = () => {
    releaseBlobUrl();
    setImageFile(null);
    setImagePreview("");
    setImageDirty(true);
  };

  const handleSubmit = async (values: CreateNewsFormValues) => {
    setIsSubmitting(true);
    try {
      const removed = imageDirty && !imageFile;

      await onSubmitNews(values, { file: imageFile, removed });
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
            {mode === "edit" ? "Խմբագրել նորությունը" : "Ավելացնել նորություն"}
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
                  value="hy"
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

              {locales.map((lang) => (
                <TabsContent
                  key={lang}
                  value={lang}
                  forceMount
                  className="mt-4 flex w-full flex-col gap-4 data-[state=inactive]:hidden"
                >
                  <FormField
                    control={form.control}
                    name={`title.${lang}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[12px] font-semibold text-[#575757]">
                          {fieldLabels[lang].title}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={fieldPlaceholders[lang].title}
                            className="h-9 rounded-[9px] border-[#e6e7eb] bg-white px-3 text-[13px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`content.${lang}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[12px] font-semibold text-[#575757]">
                          {fieldLabels[lang].content}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={fieldPlaceholders[lang].content}
                            className="min-h-[96px] rounded-[9px] border-[#e6e7eb] bg-white px-3 py-2 text-[13px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-5 flex flex-col gap-4">
              <FormField
                control={form.control}
                name="publishedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px] font-semibold text-[#575757]">
                      Հրապարակվել է
                    </FormLabel>
                    <FormControl>
                      <DateFieldInput
                        name={field.name}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                        className="h-9 rounded-[9px] border-[#e6e7eb] bg-white px-3 text-[13px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-2">
                <span className="text-[12px] font-semibold text-[#575757]">Նկար</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageSelected}
                />
                <div className="flex items-end gap-4">
                  <div className="flex h-[69px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-[9px] border border-[#e6e7eb] bg-[#f3f4f6]">
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolveImageSrc(imagePreview)}
                        alt="Նկար"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="size-6 text-[#c8c8c8]" aria-hidden />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      className="w-fit text-left text-[13px] font-medium text-[#275199] hover:underline"
                      onClick={handlePickImage}
                    >
                      {imagePreview ? "Փոխարինել" : "Վերբեռնել"}
                    </button>
                    {imagePreview ? (
                      <button
                        type="button"
                        className="w-fit text-left text-[13px] font-medium text-[#c00] hover:underline"
                        onClick={handleRemoveImage}
                      >
                        Ջնջել
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
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
