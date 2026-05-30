"use client";

import React, { useEffect, useRef, useState } from "react";
import { ImageIcon, Plus, X } from "lucide-react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { LangSwitcher } from "@/components/main/LangSwitcher";
import {
  EMPTY_MAIN_PAGE,
  fromApiHomePage,
  type HomePageLocalizedText,
  type MainHomeBlock,
  type MainLangCode,
  type MainPageMock,
  type MainUsefulLink,
} from "@/components/main/main-mock-data";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  fetchHomePage,
  updateHomePageFeaturedBlocks,
  updateHomePageHero,
  updateHomePageNews,
  updateHomePageUsefulLinks,
} from "@/services/mainPageService";
import { fetchNews } from "@/services/newsService";
import { fetchSections } from "@/services/sectionsService";
import type { Section } from "@/types/section";

const fieldBorder =
  "rounded-[9px] border border-[#e6e7eb] bg-white text-[14px] text-[#2c2c2c] placeholder:text-[#646464] shadow-none";

const heroFormSchema = z.object({
  heroTitle: z.object({
    hy: z.string().min(1, "Վերնագիրը պարտադիր է"),
    en: z.string().optional(),
    ru: z.string().optional(),
  }),
  heroShortDescription: z.object({
    hy: z.string().min(1, "Կարճ նկարագրությունը պարտադիր է"),
    en: z.string().optional(),
    ru: z.string().optional(),
  }),
  heroTextContent: z.object({
    hy: z.string().min(1, "Տեքստային բովանդակությունը պարտադիր է"),
    en: z.string().optional(),
    ru: z.string().optional(),
  }),
  heroImage: z.string().min(1, "Նկարը պարտադիր է"),
});
type HeroFormValues = z.infer<typeof heroFormSchema>;

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

function KeyRow({
  lang,
  onLangChange,
}: {
  lang: MainLangCode;
  onLangChange: (v: MainLangCode) => void;
}) {
  return (
    <div className="flex justify-end">
      <LangSwitcher value={lang} onChange={onLangChange} className="sm:shrink-0" />
    </div>
  );
}

function TagChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="flex h-9 max-w-full items-center gap-2 rounded-[9px] bg-[#eff0f2] pr-1 pl-3 text-[13px] text-[#2c2c2c]">
      <span className="min-w-0 truncate">{label}</span>
      <button
        type="button"
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#646464] hover:bg-black/5"
        onClick={onRemove}
        aria-label="Հեռացնել"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function UploadStub({ compact }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-end gap-4", compact && "flex-wrap")}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded border border-[#e6e7eb] bg-[#f3f4f6]",
          compact ? "size-[38px]" : "h-[69px] w-[68px]"
        )}
      >
        <ImageIcon className="size-6 text-[#c8c8c8]" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] text-[#2c2c2c]">Նկար</span>
        <button
          type="button"
          className="w-fit text-left text-[13px] font-medium text-[#275199] hover:underline"
          onClick={() => toast.message("Վերբեռնումը կկապվի API-ի հետ։")}
        >
          Վերբեռնել
        </button>
      </div>
    </div>
  );
}

function resolveHomePageImageSrc(value: string): string {
  if (!value) return "";
  if (value.startsWith("blob:") || value.startsWith("data:")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  return `${base}${value.startsWith("/") ? "" : "/"}${value}`;
}

function HeroImageFileControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: { previewUrl: string; file: File | null }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resolvedImageSrc = resolveHomePageImageSrc(value);

  async function onFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Խնդրում ենք ընտրել նկարի ֆայլ։");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    if (value.startsWith("blob:")) URL.revokeObjectURL(value);
    onChange({ previewUrl, file });
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => void onFileSelected(event)}
      />
      <div className="flex items-end gap-4">
        <div className="flex h-[69px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded border border-[#e6e7eb] bg-[#f3f4f6]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolvedImageSrc} alt="Hero" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="size-6 text-[#c8c8c8]" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-[#2c2c2c]">Նկար</span>
          <button
            type="button"
            className="w-fit text-left text-[13px] font-medium text-[#275199] hover:underline"
            onClick={() => inputRef.current?.click()}
          >
            {value ? "Փոխարինել" : "Վերբեռնել"}
          </button>
          {value ? (
            <button
              type="button"
              className="w-fit text-left text-[13px] font-medium text-[#c00] hover:underline"
              onClick={() => {
                if (value.startsWith("blob:")) URL.revokeObjectURL(value);
                onChange({ previewUrl: "", file: null });
              }}
            >
              Ջնջել
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function HeroImageControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resolvedImageSrc = resolveHomePageImageSrc(value);

  async function onFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Խնդրում ենք ընտրել նկարի ֆայլ։");
      return;
    }
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result !== "string") {
            reject(new Error("Invalid image data"));
            return;
          }
          resolve(result);
        };
        reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
      onChange(base64);
    } catch {
      toast.error("Չհաջողվեց բեռնել նկարը։");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => void onFileSelected(event)}
      />
      <div className="flex items-end gap-4">
        <div className="flex h-[69px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded border border-[#e6e7eb] bg-[#f3f4f6]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolvedImageSrc} alt="Hero" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="size-6 text-[#c8c8c8]" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-[#2c2c2c]">Նկար</span>
          <button
            type="button"
            className="w-fit text-left text-[13px] font-medium text-[#275199] hover:underline"
            onClick={() => inputRef.current?.click()}
          >
            {value ? "Փոխարինել" : "Վերբեռնել"}
          </button>
          {value ? (
            <button
              type="button"
              className="w-fit text-left text-[13px] font-medium text-[#c00] hover:underline"
              onClick={() => onChange("")}
            >
              Ջնջել
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function BlockCard({
  block,
  index,
  lang,
  onLangChange,
  availableSections,
  onChange,
  onImageFileChange,
}: {
  block: MainHomeBlock;
  index: number;
  lang: MainLangCode;
  onLangChange: (v: MainLangCode) => void;
  availableSections: Section[];
  onChange: (next: MainHomeBlock) => void;
  onImageFileChange: (index: number, file: File | null) => void;
}) {
  return (
    <ContentCard>
      <div className="mb-4 flex items-stretch gap-3">
        <div
          className="w-1 shrink-0 rounded-sm"
          style={{ backgroundColor: block.accent, minHeight: 28 }}
          aria-hidden
        />
        <h2 className="text-[14px] font-medium text-[#2c2c2c]">{block.sectionLabel}</h2>
      </div>

      <div className="flex flex-col gap-4">
        <KeyRow lang={lang} onLangChange={onLangChange} />

        <div className="flex flex-col gap-1">
          <span className="text-[12px] text-[#575757]">Title key</span>
          <Input
            value={block.titleKey}
            onChange={(e) => onChange({ ...block, titleKey: e.target.value })}
            className={cn("h-9", fieldBorder)}
          />
        </div>

        <Input
          value={readLocalizedByLang(block.title, lang)}
          onChange={(e) =>
            onChange({
              ...block,
              title: writeLocalizedByLang(block.title, e.target.value, lang),
            })
          }
          className={cn("h-9", fieldBorder)}
          placeholder="Վերնագիր"
        />

        <Input
          value={readLocalizedByLang(block.subtitle, lang)}
          onChange={(e) =>
            onChange({
              ...block,
              subtitle: writeLocalizedByLang(block.subtitle, e.target.value, lang),
            })
          }
          className={cn("h-9", fieldBorder)}
          placeholder="Ենթավերնագիր"
        />

        <Select
          value=""
          onValueChange={(id) => {
            if (block.sectionIds.includes(id)) return;
            onChange({
              ...block,
              sectionIds: [...block.sectionIds, id],
            });
          }}
        >
          <SelectTrigger
            className={cn("h-9 w-full max-w-[306px] sm:w-[306px]", fieldBorder, "text-[#2c2c2c]")}
          >
            <SelectValue placeholder="Ընտրել բաժինները" />
          </SelectTrigger>
          <SelectContent>
            {availableSections
              .filter((s) => !block.sectionIds.includes(s._id))
              .map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name.hy}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-3">
          {block.sectionIds.map((sid) => {
            const fromAvail = availableSections.find((s) => s._id === sid);
            const fromEmbedded = block.sections.find((s) => s._id === sid);
            const label = fromAvail?.name.hy ?? fromEmbedded?.name.hy ?? sid;
            return (
              <TagChip
                key={sid}
                label={label}
                onRemove={() =>
                  onChange({
                    ...block,
                    sectionIds: block.sectionIds.filter((x) => x !== sid),
                  })
                }
              />
            );
          })}
        </div>

        <HeroImageFileControl
          value={block.image}
          onChange={({ previewUrl, file }) => {
            onImageFileChange(index, file);
            onChange({ ...block, image: previewUrl });
          }}
        />
      </div>
    </ContentCard>
  );
}

function UsefulLinkRow({
  link,
  lang,
  onChange,
  onImageFileChange,
  onRemove,
}: {
  link: MainUsefulLink;
  lang: MainLangCode;
  onChange: (next: MainUsefulLink) => void;
  onImageFileChange: (file: File | null) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[9px] border border-[#e6e7eb] bg-white p-4">
      <div className="flex flex-col gap-1">
        <span className="text-[12px] text-[#575757]">Անվանում</span>
        <Input
          value={readLocalizedByLang(link.name, lang)}
          onChange={(e) =>
            onChange({
              ...link,
              name: writeLocalizedByLang(link.name, e.target.value, lang),
            })
          }
          className={cn("h-9", fieldBorder)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[12px] text-[#575757]">Նկարագրություն</span>
        <Textarea
          value={readLocalizedByLang(link.description, lang)}
          onChange={(e) =>
            onChange({
              ...link,
              description: writeLocalizedByLang(link.description, e.target.value, lang),
            })
          }
          className={cn("min-h-[70px] resize-y", fieldBorder)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[12px] text-[#575757]">Հղում</span>
        <Input
          value={link.url}
          placeholder="https://"
          onChange={(e) => onChange({ ...link, url: e.target.value })}
          className={cn("h-9", fieldBorder)}
        />
      </div>

      <HeroImageFileControl
        value={link.image}
        onChange={({ previewUrl, file }) => {
          onImageFileChange(file);
          onChange({ ...link, image: previewUrl });
        }}
      />

      <div className="flex justify-end">
        <button
          type="button"
          className="text-[13px] font-medium text-[#c00] hover:underline"
          onClick={onRemove}
        >
          Ջնջել
        </button>
      </div>
    </div>
  );
}

function ensureHyLocalized(localized: HomePageLocalizedText): HomePageLocalizedText {
  return { ...localized, hy: localized.hy ?? "" };
}

function readLocalizedByLang(localized: HomePageLocalizedText, lang: MainLangCode): string {
  if (lang === "hy") return localized.hy ?? "";
  return localized[lang] ?? "";
}

function writeLocalizedByLang(
  current: HomePageLocalizedText,
  value: string,
  lang: MainLangCode
): HomePageLocalizedText {
  const next: HomePageLocalizedText =
    lang === "hy" ? { ...current, hy: value } : { ...current, [lang]: value };
  return ensureHyLocalized(next);
}

export function MainPageEditor() {
  const initialJson = useRef(JSON.stringify(EMPTY_MAIN_PAGE));
  const [heroLang, setHeroLang] = useState<MainLangCode>("hy");
  const [usefulLinksLang, setUsefulLinksLang] = useState<MainLangCode>("hy");
  const [blockLangById, setBlockLangById] = useState<Record<string, MainLangCode>>({});
  const [availableSections, setAvailableSections] = useState<Section[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [heroImageFile, setHeroImageFile] = useState<File | string | null>(null);
  const [featuredBlockFiles, setFeaturedBlockFiles] = useState<Array<File | string | null>>([
    null,
    null,
    null,
  ]);
  const [usefulLinkFiles, setUsefulLinkFiles] = useState<Array<File | string | null>>([]);
  const [data, setData] = useState<MainPageMock>(() => structuredClone(EMPTY_MAIN_PAGE));
  const form = useForm<HeroFormValues>({
    resolver: zodResolver(heroFormSchema),
    defaultValues: {
      heroTitle: EMPTY_MAIN_PAGE.heroTitle,
      heroShortDescription: EMPTY_MAIN_PAGE.heroShortDescription,
      heroTextContent: EMPTY_MAIN_PAGE.heroTextContent,
      heroImage: EMPTY_MAIN_PAGE.heroImage,
    },
    mode: "onSubmit",
  });
  const dirty = JSON.stringify(data) !== initialJson.current;

  function getBlockLang(blockId: string): MainLangCode {
    return blockLangById[blockId] ?? "hy";
  }

  function setBlockLang(blockId: string, nextLang: MainLangCode) {
    setBlockLangById((prev) => ({ ...prev, [blockId]: nextLang }));
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadHomePage() {
      try {
        const [homeResponse, sectionsResponse, newsResponse] = await Promise.all([
          fetchHomePage(),
          fetchSections().catch((error) => {
            console.warn("Failed to load sections", error);
            return [] as Section[];
          }),
          fetchNews().catch((error) => {
            console.warn("Failed to load news", error);
            return [];
          }),
        ]);
        if (isCancelled) return;
        const mapped = fromApiHomePage(homeResponse, "hy");
        mapped.news.availableItems = Array.isArray(newsResponse) ? newsResponse : [];
        initialJson.current = JSON.stringify(mapped);
        setHeroImageFile(mapped.heroImage || null);
        setFeaturedBlockFiles(mapped.blocks.map((b) => b.image || null));
        setUsefulLinkFiles(mapped.usefulLinks.links.map((l) => l.image || null));
        setData(mapped);
        setAvailableSections(sectionsResponse);
        form.reset({
          heroTitle: mapped.heroTitle,
          heroShortDescription: mapped.heroShortDescription,
          heroTextContent: mapped.heroTextContent,
          heroImage: mapped.heroImage,
        });
      } catch (error) {
        if (isCancelled) return;
        toast.error("Չհաջողվեց բեռնել գլխավոր էջի տվյալները։");
      }
    }

    loadHomePage();

    return () => {
      isCancelled = true;
    };
  }, []);

  function readLocalized(localized: HomePageLocalizedText): string {
    return readLocalizedByLang(localized, heroLang);
  }

  function writeLocalized(current: HomePageLocalizedText, value: string): HomePageLocalizedText {
    return writeLocalizedByLang(current, value, heroLang);
  }

  function toFeaturedBlocksPayload() {
    return {
      featuredBlocks: data.blocks.map((block) => ({
        titleKey: block.titleKey,
        sectionIds: block.sectionIds,
      })),
      featuredBlockImages: featuredBlockFiles,
    };
  }

  function toUsefulLinksPayload() {
    const usefulLinks = data.usefulLinks.links.map((link) => ({
      url: link.url,
      image: link.image,
      name: ensureHyLocalized(link.name),
      description: ensureHyLocalized(link.description),
    }));

    return {
      usefulLinks,
      usefulLinkImages: usefulLinkFiles,
    };
  }

  function toNewsPayload() {
    return {
      newsIds: data.news.selectedIds,
    };
  }

  async function handleSave() {
    if (!dirty) {
      toast.message("Փոփոխություններ չկան։");
      return;
    }
    try {
      setIsSaving(true);
      await updateHomePageHero({
        heroTitle: ensureHyLocalized(data.heroTitle),
        heroShortDescription: ensureHyLocalized(data.heroShortDescription),
        heroTextContent: ensureHyLocalized(data.heroTextContent),
        heroImage: heroImageFile,
      });
      await updateHomePageFeaturedBlocks(toFeaturedBlocksPayload());
      await updateHomePageNews(toNewsPayload());
      await updateHomePageUsefulLinks(toUsefulLinksPayload());
      initialJson.current = JSON.stringify(data);
      setHeroImageFile(data.heroImage || null);
      setFeaturedBlockFiles(data.blocks.map((b) => b.image || null));
      setUsefulLinkFiles(data.usefulLinks.links.map((l) => l.image || null));
      setData((d) => structuredClone(d));
      toast.success("Պահպանված է։");
    } catch {
      toast.error("Չհաջողվեց պահպանել գլխավոր էջի տվյալները։");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form
        className="flex w-full flex-col gap-5 pb-10"
        onSubmit={form.handleSubmit(
          async () => {
            await handleSave();
          },
          () => toast.error("Hero բաժնի պարտադիր դաշտերը լրացված չեն։")
        )}
      >
        <div className="sticky top-0 z-10 flex min-h-11 w-full flex-col gap-4 bg-[#f9fafb] pt-7 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl leading-6 font-medium text-[#2c2c2c]">
            Գլխավոր էջի Փոփոխություններ
          </h1>
          <Button
            type="submit"
            disabled={!dirty || isSaving}
            className={cn(
              "h-11 min-w-[256px] rounded-lg px-6 text-[13px] font-medium",
              dirty
                ? "border-0 bg-[#004d99] text-white hover:bg-[#004080]"
                : "cursor-not-allowed border-0 bg-[#ededed] text-[#8b8b8b] hover:bg-[#ededed]"
            )}
          >
            {isSaving ? "Պահպանվում է..." : "Պահպանել Փոփոխությունները"}
          </Button>
        </div>

        <ContentCard>
          <h2 className="mb-4 text-[14px] font-medium text-[#2c2c2c]">Վերնագրեր</h2>
          <div className="flex flex-col gap-4">
            <KeyRow lang={heroLang} onLangChange={setHeroLang} />
            <Input
              value={readLocalized(data.heroTitle)}
              onChange={(e) =>
                setData((d) => {
                  const heroTitle = writeLocalized(d.heroTitle, e.target.value);
                  form.setValue("heroTitle", ensureHyLocalized(heroTitle), {
                    shouldValidate: true,
                  });
                  return {
                    ...d,
                    heroTitle,
                  };
                })
              }
              className={cn("h-9", fieldBorder)}
            />
            <Textarea
              value={readLocalized(data.heroShortDescription)}
              onChange={(e) =>
                setData((d) => {
                  const heroShortDescription = writeLocalized(
                    d.heroShortDescription,
                    e.target.value
                  );
                  form.setValue("heroShortDescription", ensureHyLocalized(heroShortDescription), {
                    shouldValidate: true,
                  });
                  return {
                    ...d,
                    heroShortDescription,
                  };
                })
              }
              className={cn("min-h-[70px] resize-y", fieldBorder)}
            />
            <Textarea
              value={readLocalized(data.heroTextContent)}
              onChange={(e) =>
                setData((d) => {
                  const heroTextContent = writeLocalized(d.heroTextContent, e.target.value);
                  form.setValue("heroTextContent", ensureHyLocalized(heroTextContent), {
                    shouldValidate: true,
                  });
                  return {
                    ...d,
                    heroTextContent,
                  };
                })
              }
              placeholder="Տեքստային բովանդակություն"
              className={cn("min-h-[70px] resize-y", fieldBorder)}
            />
            <HeroImageFileControl
              value={data.heroImage}
              onChange={({ previewUrl, file }) => {
                setHeroImageFile(file);
                setData((d) => {
                  form.setValue("heroImage", previewUrl, { shouldValidate: true });
                  return {
                    ...d,
                    heroImage: previewUrl,
                  };
                });
              }}
            />
          </div>
        </ContentCard>

        {data.blocks.map((block, index) => (
          <BlockCard
            key={block.id}
            block={block}
            index={index}
            lang={getBlockLang(block.id)}
            onLangChange={(nextLang) => setBlockLang(block.id, nextLang)}
            availableSections={availableSections}
            onChange={(next) =>
              setData((d) => ({
                ...d,
                blocks: d.blocks.map((b, i) => (i === index ? next : b)),
              }))
            }
            onImageFileChange={(i, file) =>
              setFeaturedBlockFiles((prev) => {
                const next = prev.slice();
                next[i] = file;
                return next;
              })
            }
          />
        ))}

        <ContentCard>
          <h2 className="mb-4 text-[14px] font-medium text-[#2c2c2c]">Նորություններ</h2>
          <div className="flex flex-col gap-4">
            <Select
              value=""
              onValueChange={(id) =>
                setData((d) =>
                  d.news.selectedIds.includes(id)
                    ? d
                    : {
                        ...d,
                        news: {
                          ...d.news,
                          selectedIds: [...d.news.selectedIds, id],
                        },
                      }
                )
              }
            >
              <SelectTrigger className={cn("h-9 w-full", fieldBorder)}>
                <SelectValue placeholder="Ընտրել նորությունները" />
              </SelectTrigger>
              <SelectContent>
                {data.news.availableItems
                  .filter((item) => !data.news.selectedIds.includes(item._id))
                  .map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-3">
              {data.news.selectedIds.map((id) => {
                const item = data.news.availableItems.find((n) => n._id === id);
                return (
                  <TagChip
                    key={id}
                    label={item?.title ?? id}
                    onRemove={() =>
                      setData((d) => ({
                        ...d,
                        news: {
                          ...d.news,
                          selectedIds: d.news.selectedIds.filter((x) => x !== id),
                        },
                      }))
                    }
                  />
                );
              })}
            </div>
          </div>
        </ContentCard>

        <ContentCard>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[14px] font-medium text-[#2c2c2c]">Օգտակար հղումներ</h2>
            <Button
              type="button"
              variant="ghost"
              className="flex h-auto items-center gap-2 p-0 text-[14px] font-medium text-[#275199] hover:bg-transparent hover:text-[#275199] hover:underline"
              onClick={() => {
                setUsefulLinkFiles((prev) => [...prev, null]);
                setData((d) => ({
                  ...d,
                  usefulLinks: {
                    ...d.usefulLinks,
                    links: [
                      ...d.usefulLinks.links,
                      {
                        id: `l-${Date.now()}`,
                        url: "",
                        name: { hy: "Վերնագրիրը այստեղ" },
                        description: { hy: "" },
                        image: "",
                      },
                    ],
                  },
                }));
              }}
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-[#275199] text-white">
                <Plus className="size-3.5" strokeWidth={2.5} />
              </span>
              Ավելացնել
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            <KeyRow lang={usefulLinksLang} onLangChange={setUsefulLinksLang} />
            <div className="flex flex-col gap-3">
              {data.usefulLinks.links.map((link) => (
                <UsefulLinkRow
                  key={link.id}
                  link={link}
                  lang={usefulLinksLang}
                  onChange={(next) =>
                    setData((d) => ({
                      ...d,
                      usefulLinks: {
                        ...d.usefulLinks,
                        links: d.usefulLinks.links.map((l) => (l.id === link.id ? next : l)),
                      },
                    }))
                  }
                  onImageFileChange={(file) => {
                    setUsefulLinkFiles((prev) => {
                      const index = data.usefulLinks.links.findIndex((l) => l.id === link.id);
                      if (index < 0) return prev;
                      const next = prev.slice();
                      next[index] = file;
                      return next;
                    });
                  }}
                  onRemove={() => {
                    const index = data.usefulLinks.links.findIndex((l) => l.id === link.id);
                    if (index >= 0) {
                      const currentValue = data.usefulLinks.links[index]?.image ?? "";
                      if (currentValue.startsWith("blob:")) URL.revokeObjectURL(currentValue);
                      setUsefulLinkFiles((prev) => prev.filter((_, i) => i !== index));
                    }
                    setData((d) => ({
                      ...d,
                      usefulLinks: {
                        ...d.usefulLinks,
                        links: d.usefulLinks.links.filter((l) => l.id !== link.id),
                      },
                    }));
                  }}
                />
              ))}
            </div>
          </div>
        </ContentCard>
      </form>
    </Form>
  );
}
