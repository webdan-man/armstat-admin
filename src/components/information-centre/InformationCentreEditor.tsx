"use client";

import React, { useEffect, useRef, useState } from "react";
import { ImageIcon, Plus } from "lucide-react";
import { toast } from "sonner";

import { LangSwitcher } from "@/components/main/LangSwitcher";
import type { MainLangCode } from "@/components/main/main-mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  fetchInformationCenter,
  updateInformationCenter,
  type InformationCenterApiResponse,
  type LocalizedText,
} from "@/services/informationCenterService";

const fieldBorder =
  "rounded-[9px] border border-[#e6e7eb] bg-white text-[14px] text-[#2c2c2c] placeholder:text-[#646464] shadow-none";

type InformationCenterEditorState = {
  _id: string;
  title: LocalizedText;
  description: LocalizedText;
  image: string;
  sections: Array<{
    id: string;
    title: LocalizedText;
    description: LocalizedText;
    link: string;
    image: string;
  }>;
};

function ContentCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
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

function ensureHyLocalized(localized: LocalizedText): LocalizedText {
  return { ...localized, hy: localized.hy ?? "" };
}

function readLocalizedByLang(localized: LocalizedText, lang: MainLangCode): string {
  if (lang === "hy") return localized.hy ?? "";
  return localized[lang] ?? "";
}

function writeLocalizedByLang(
  current: LocalizedText,
  value: string,
  lang: MainLangCode
): LocalizedText {
  const next: LocalizedText = lang === "hy" ? { ...current, hy: value } : { ...current, [lang]: value };
  return ensureHyLocalized(next);
}

function resolveImageSrc(value: string): string {
  if (!value) return "";
  if (value.startsWith("blob:") || value.startsWith("data:")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const base = (process.env.NEXT_PUBLIC_IMAGE_STORAGE_URL ?? "").replace(/\/$/, "");
  return `${base}${value.startsWith("/") ? "" : "/"}${value}`;
}

function ImageFileControl({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (next: { previewUrl: string; file: File | null }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resolvedImageSrc = resolveImageSrc(value);

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
            <img src={resolvedImageSrc} alt={label} className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="size-6 text-[#c8c8c8]" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-[#2c2c2c]">{label}</span>
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

function SectionEditor({
  index,
  section,
  lang,
  onLangChange,
  onChange,
  onImageFileChange,
  onRemove,
}: {
  index: number;
  section: InformationCenterEditorState["sections"][number];
  lang: MainLangCode;
  onLangChange: (v: MainLangCode) => void;
  onChange: (next: InformationCenterEditorState["sections"][number]) => void;
  onImageFileChange: (file: File | null) => void;
  onRemove: () => void;
}) {
  const indexLabel = index + 1 < 10 ? `0${index + 1}` : String(index + 1);

  return (
    <div className="space-y-4 rounded-[9px] border border-[#dbdbdc] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[15px] font-medium text-[#2c2c2c]">{indexLabel}</span>
        <LangSwitcher value={lang} onChange={onLangChange} />
      </div>

      <Input
        value={readLocalizedByLang(section.title, lang)}
        onChange={(e) => onChange({ ...section, title: writeLocalizedByLang(section.title, e.target.value, lang) })}
        className={cn("min-h-[61px] w-full py-2", fieldBorder)}
        placeholder="Վերնագիր"
      />

      <Textarea
        value={readLocalizedByLang(section.description, lang)}
        onChange={(e) =>
          onChange({
            ...section,
            description: writeLocalizedByLang(section.description, e.target.value, lang),
          })
        }
        className={cn("min-h-[176px] resize-y", fieldBorder)}
        placeholder="Նկարագրություն"
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex w-full min-w-0 flex-col gap-1 sm:max-w-[507px] lg:flex-1">
          <span className="text-[12px] text-[#575757]">Հղում</span>
          <Input
            value={section.link}
            onChange={(e) => onChange({ ...section, link: e.target.value })}
            className={cn("h-9", fieldBorder)}
            placeholder="https://"
          />
        </div>
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

      <ImageFileControl
        value={section.image}
        label="Նկար"
        onChange={({ previewUrl, file }) => {
          onImageFileChange(file);
          onChange({ ...section, image: previewUrl });
        }}
      />
    </div>
  );
}

export function InformationCentreEditor() {
  const initialJson = useRef(JSON.stringify({}));
  const [lang, setLang] = useState<MainLangCode>("hy");
  const [isSaving, setIsSaving] = useState(false);
  const [pageImageFile, setPageImageFile] = useState<File | null>(null);
  const [sectionImageFiles, setSectionImageFiles] = useState<Array<File | null>>([]);
  const [data, setData] = useState<InformationCenterEditorState>(() => ({
    _id: "",
    title: { hy: "" },
    description: { hy: "" },
    image: "",
    sections: [],
  }));

  const dirty = JSON.stringify(data) !== initialJson.current;

  useEffect(() => {
    let isCancelled = false;

    async function loadInformationCenter() {
      try {
        const res = await fetchInformationCenter();
        if (isCancelled) return;
        const mapped: InformationCenterEditorState = fromApiInformationCenter(res);
        initialJson.current = JSON.stringify(mapped);
        setPageImageFile(null);
        setSectionImageFiles(mapped.sections.map(() => null));
        setData(mapped);
      } catch {
        if (isCancelled) return;
        toast.error("Չհաջողվեց բեռնել տեղեկատվական կենտրոնի տվյալները։");
      }
    }

    loadInformationCenter();

    return () => {
      isCancelled = true;
    };
  }, []);

  function readLocalized(localized: LocalizedText): string {
    return readLocalizedByLang(localized, lang);
  }

  function writeLocalized(current: LocalizedText, value: string): LocalizedText {
    return writeLocalizedByLang(current, value, lang);
  }

  async function handleSave() {
    if (!dirty) {
      toast.message("Փոփոխություններ չկան։");
      return;
    }

    try {
      setIsSaving(true);
      const nextTitle = ensureHyLocalized(data.title);
      const nextDescription = ensureHyLocalized(data.description);
      const sections = data.sections.map((s) => ({
        title: ensureHyLocalized(s.title),
        description: ensureHyLocalized(s.description),
        link: s.link,
        image: s.image,
      }));

      await updateInformationCenter({
        title: nextTitle,
        description: nextDescription,
        image: pageImageFile,
        sections,
        sectionImages: sectionImageFiles,
      });

      initialJson.current = JSON.stringify(data);
      setData((d) => structuredClone(d));
      setPageImageFile(null);
      setSectionImageFiles((prev) => prev.map(() => null));
      toast.success("Պահպանված է։");
    } catch {
      toast.error("Չհաջողվեց պահպանել տեղեկատվական կենտրոնի տվյալները։");
    } finally {
      setIsSaving(false);
    }
  }

  function addSection() {
    setSectionImageFiles((prev) => [...prev, null]);
    setData((d) => ({
      ...d,
      sections: [
        ...d.sections,
        {
          id: `section-${Date.now()}`,
          title: { hy: "" },
          description: { hy: "" },
          link: "",
          image: "",
        },
      ],
    }));
  }

  return (
    <div className="flex w-full flex-col gap-5 pb-10">
      <div className="flex min-h-11 w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl leading-6 font-medium text-[#2c2c2c]">
          Տեղեկատվական կենտրոն
        </h1>
        <Button
          type="button"
          disabled={!dirty || isSaving}
          className={cn(
            "h-11 min-w-[256px] rounded-lg px-6 text-[13px] font-medium",
            dirty
              ? "border-0 bg-[#004d99] text-white hover:bg-[#004080]"
              : "cursor-not-allowed border-0 bg-[#ededed] text-[#8b8b8b] hover:bg-[#ededed]"
          )}
          onClick={handleSave}
        >
          {isSaving ? "Պահպանվում է..." : "Պահպանել Փոփոխությունները"}
        </Button>
      </div>

      <ContentCard>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[14px] font-medium text-[#2c2c2c]">Վերնագիր</h2>
          <LangSwitcher value={lang} onChange={setLang} />
        </div>
        <div className="flex flex-col gap-4">
          <Input
            value={readLocalized(data.title)}
            onChange={(e) => setData((d) => ({ ...d, title: writeLocalized(d.title, e.target.value) }))}
            className={cn("h-9", fieldBorder)}
            placeholder="Վերնագիր"
          />
          <Textarea
            value={readLocalized(data.description)}
            onChange={(e) =>
              setData((d) => ({ ...d, description: writeLocalized(d.description, e.target.value) }))
            }
            className={cn("min-h-[137px] resize-y", fieldBorder)}
            placeholder="Նկարագրություն"
          />
          <ImageFileControl
            value={data.image}
            label="Նկար"
            onChange={({ previewUrl, file }) => {
              setPageImageFile(file);
              setData((d) => ({ ...d, image: previewUrl }));
            }}
          />
        </div>
      </ContentCard>

      <ContentCard>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[14px] font-medium text-[#2c2c2c]">Բաժիններ</h2>
          <Button
            type="button"
            variant="ghost"
            className="h-auto gap-2 p-0 text-[14px] font-medium text-[#275199] hover:bg-transparent hover:text-[#275199] hover:underline"
            onClick={addSection}
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-[#275199] text-white">
              <Plus className="size-3.5" strokeWidth={2.5} />
            </span>
            Ավելացնել
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          {data.sections.length === 0 ? (
            <div className="rounded-[9px] border border-[#e6e7eb] bg-white p-4 text-[13px] text-[#575757]">
              Բաժիններ չկան։ Սեղմեք “Ավելացնել”։
            </div>
          ) : null}
          {data.sections.map((section, index) => (
            <SectionEditor
              key={section.id}
              index={index}
              section={section}
              lang={lang}
              onLangChange={setLang}
              onChange={(next) =>
                setData((d) => ({
                  ...d,
                  sections: d.sections.map((s, i) => (i === index ? next : s)),
                }))
              }
              onImageFileChange={(file) =>
                setSectionImageFiles((prev) => {
                  const next = prev.slice();
                  next[index] = file;
                  return next;
                })
              }
              onRemove={() => {
                const currentValue = data.sections[index]?.image ?? "";
                if (currentValue.startsWith("blob:")) URL.revokeObjectURL(currentValue);
                setSectionImageFiles((prev) => prev.filter((_, i) => i !== index));
                setData((d) => ({
                  ...d,
                  sections: d.sections.filter((_, i) => i !== index),
                }));
              }}
            />
          ))}
        </div>
      </ContentCard>
    </div>
  );
}

function fromApiInformationCenter(api: InformationCenterApiResponse): InformationCenterEditorState {
  return {
    _id: api._id ?? "",
    title: ensureHyLocalized(api.title ?? {}),
    description: ensureHyLocalized(api.description ?? {}),
    image: api.image ?? "",
    sections: Array.isArray(api.sections)
      ? api.sections.map((s, index) => ({
          id: `section-${index}-${Date.now()}`,
          title: ensureHyLocalized(s.title ?? {}),
          description: ensureHyLocalized(s.description ?? {}),
          link: s.link ?? "",
          image: s.image ?? "",
        }))
      : [],
  };
}
