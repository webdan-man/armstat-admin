"use client";

import React, { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { LangSwitcher } from "@/components/main/LangSwitcher";
import type { MainLangCode } from "@/components/main/main-mock-data";
import { Button } from "@/components/ui/button";
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
  fetchContactUs,
  updateContactUs,
  type ContactUsApiResponse,
  type ContactUsSection,
  type ContactUsSocialLink,
  type LocalizedText,
} from "@/services/contactUsService";

const fieldBorder =
  "rounded-[9px] border border-[#e6e7eb] bg-white text-[14px] text-[#2c2c2c] placeholder:text-[#646464] shadow-none";

const selectTypeClass =
  "h-9 w-full max-w-[249px] rounded-[9px] border-[#c8c8c8] bg-white text-[13px] text-[#2c2c2c] shadow-none";

const CONTACT_TYPE_LABEL: Record<ContactUsSection["type"], string> = {
  address: "Տեսակ: Հասցե",
  info: "Տեսակ: Տվյալներ",
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

function LabeledField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-24 shrink-0 text-[12px] font-medium text-[#575757]">
        {label}
      </span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("h-9 flex-1 sm:max-w-[507px]", fieldBorder)}
      />
    </div>
  );
}

type ContactUsEditorSection = ContactUsSection & { id: string };

const SOCIAL_LINK_PRESETS: Array<{
  type: string;
  name: string;
  label: string;
}> = [
  { type: "facebook", name: "Facebook", label: "Facebook" },
  { type: "instagram", name: "Instagram", label: "Instagram" },
  { type: "telegram", name: "Telegram", label: "Telegram" },
  { type: "youtube", name: "Youtube", label: "Youtube" },
  { type: "x", name: "X / Twitter", label: "X / Twitter" },
];

type ContactUsEditorState = {
  _id: string;
  title: LocalizedText;
  description: LocalizedText;
  notificationsEmailRow: LocalizedText;
  sections: ContactUsEditorSection[];
  mapSection: {
    title: string;
    value: string;
  };
  socialLinks: ContactUsSocialLink[];
};

function ensureHyLocalized(localized: LocalizedText): LocalizedText {
  return { ...localized, hy: localized.hy ?? "" };
}

function readLocalizedByLang(localized: LocalizedText, lang: MainLangCode): string {
  if (lang === "hy") return localized.hy ?? "";
  return localized[lang] ?? "";
}

function writeLocalizedByLang(current: LocalizedText, value: string, lang: MainLangCode): LocalizedText {
  const next: LocalizedText = lang === "hy" ? { ...current, hy: value } : { ...current, [lang]: value };
  return ensureHyLocalized(next);
}

function SectionCard({
  section,
  index,
  lang,
  onLangChange,
  onChange,
  onRemove,
}: {
  section: ContactUsEditorSection;
  index: number;
  lang: MainLangCode;
  onLangChange: (v: MainLangCode) => void;
  onChange: (next: ContactUsEditorSection) => void;
  onRemove: () => void;
}) {
  const indexLabel = index + 1 < 10 ? `0${index + 1}` : String(index + 1);
  return (
    <div className="space-y-4 rounded-[9px] border border-[#dbdbdc] p-5">
              <p className="mb-2 text-[15px] font-medium text-[#2c2c2c]">{indexLabel}</p>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Select
          value={section.type}
          onValueChange={(v) => {
            if (v === "address") {
              onChange({ id: section.id, type: "address", value: "" });
              return;
            }
            onChange({ id: section.id, type: "info", title: "", phone: "", email: "", link: "" });
          }}
        >
          <SelectTrigger className={selectTypeClass}>
            <SelectValue placeholder={CONTACT_TYPE_LABEL[section.type]} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="address">{CONTACT_TYPE_LABEL.address}</SelectItem>
            <SelectItem value="info">{CONTACT_TYPE_LABEL.info}</SelectItem>
          </SelectContent>
        </Select>
        <LangSwitcher value={lang} onChange={onLangChange} />
      </div>

      {section.type === "address" ? (
        <div className="flex flex-col gap-3">
          <Input
            value={section.value ?? ""}
            onChange={(e) => onChange({ ...section, value: e.target.value })}
            className={cn("h-9 w-full", fieldBorder)}
            placeholder="Հասցե"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Input
            value={section.title ?? ""}
            onChange={(e) => onChange({ ...section, title: e.target.value })}
            className={cn("min-h-9 w-full", fieldBorder)}
            placeholder="Վերնագիր"
          />
          <LabeledField
            label="Հեռախոս"
            value={section.phone ?? ""}
            onChange={(phone) => onChange({ ...section, phone })}
          />
          <LabeledField
            label="Հղում"
            value={section.link ?? ""}
            onChange={(link) => onChange({ ...section, link })}
          />
          <LabeledField
            label="Էլ. հասցե"
            value={section.email ?? ""}
            onChange={(email) => onChange({ ...section, email })}
          />
        </div>
      )}

      <div className="flex justify-end">
        <button type="button" className="text-[13px] font-medium text-[#c00] hover:underline" onClick={onRemove}>
          Ջնջել
        </button>
      </div>
    </div>
  );
}

export function ContactUsEditor() {
  const initialJson = useRef(JSON.stringify({}));
  const [lang, setLang] = useState<MainLangCode>("hy");
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<ContactUsEditorState>(() => ({
    _id: "",
    title: { hy: "" },
    description: { hy: "" },
    notificationsEmailRow: { hy: "" },
    sections: [],
    mapSection: { title: "", value: "" },
    socialLinks: SOCIAL_LINK_PRESETS.map((p) => ({ type: p.type, name: p.name, link: "" })),
  }));

  const dirty = JSON.stringify(data) !== initialJson.current;

  useEffect(() => {
    let isCancelled = false;

    async function loadContactUs() {
      try {
        const res = await fetchContactUs();
        if (isCancelled) return;
        const mapped = fromApiContactUs(res);
        initialJson.current = JSON.stringify(mapped);
        setData(mapped);
      } catch {
        if (isCancelled) return;
        toast.error("Չհաջողվեց բեռնել «Հետադարձ կապ» տվյալները։");
      }
    }

    loadContactUs();

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

      await updateContactUs({
        title: ensureHyLocalized(data.title),
        description: ensureHyLocalized(data.description),
        notificationsEmailRow: ensureHyLocalized(data.notificationsEmailRow),
        sections: data.sections.map(({ id: _id, ...s }) => s),
        mapSection: {
          title: data.mapSection.title ?? "",
          value: data.mapSection.value ?? "",
        },
        socialLinks: data.socialLinks.map((s) => ({
          type: s.type ?? "",
          name: s.name ?? "",
          link: s.link ?? "",
        })),
      });

      initialJson.current = JSON.stringify(data);
      setData((d) => structuredClone(d));
      toast.success("Պահպանված է։");
    } catch {
      toast.error("Չհաջողվեց պահպանել «Հետադարձ կապ» տվյալները։");
    } finally {
      setIsSaving(false);
    }
  }

  function addSection() {
    setData((d) => ({
      ...d,
      sections: [...d.sections, { id: `section-${Date.now()}`, type: "address", value: "" }],
    }));
  }

  return (
    <div className="flex w-full flex-col gap-5 pb-10">
      <div className="flex min-h-11 w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl leading-6 font-medium text-[#2c2c2c]">
          Հետադարձ կապ
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
            onChange={(e) => setData((d) => ({ ...d, description: writeLocalized(d.description, e.target.value) }))}
            className={cn("min-h-[137px] resize-y", fieldBorder)}
            placeholder="Նկարագրություն"
          />
        </div>
      </ContentCard>

      <ContentCard>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[14px] font-medium text-[#2c2c2c]">Ծանուցումների էլ․ հասցե</h2>
          <LangSwitcher value={lang} onChange={setLang} />
        </div>
        <Input
          value={readLocalized(data.notificationsEmailRow)}
          onChange={(e) =>
            setData((d) => ({ ...d, notificationsEmailRow: writeLocalized(d.notificationsEmailRow, e.target.value) }))
          }
          className={cn("h-9", fieldBorder)}
          placeholder="example@domain.com"
        />
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
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              lang={lang}
              onLangChange={setLang}
              onChange={(next) =>
                setData((d) => ({
                  ...d,
                  sections: d.sections.map((s, i) => (i === index ? next : s)),
                }))
              }
              onRemove={() =>
                setData((d) => ({
                  ...d,
                  sections: d.sections.filter((_, i) => i !== index),
                }))
              }
            />
          ))}
        </div>
      </ContentCard>

      <ContentCard>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[14px] font-medium text-[#2c2c2c]">Սոցիալական հղումներ</h2>
        </div>

        <div className="flex flex-col gap-4">
          {SOCIAL_LINK_PRESETS.map((preset) => {
            const value = data.socialLinks.find((s) => s.type === preset.type)?.link ?? "";
            return (
              <div key={preset.type} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                <span className="w-24 shrink-0 text-[12px] font-medium text-[#575757]">
                  {preset.label}
                </span>
                <Input
                  value={value}
                  onChange={(e) => {
                    const link = e.target.value;
                    setData((d) => ({
                      ...d,
                      socialLinks: SOCIAL_LINK_PRESETS.map((p) => {
                        const existing = d.socialLinks.find((s) => s.type === p.type);
                        const nextLink = p.type === preset.type ? link : (existing?.link ?? "");
                        return { type: p.type, name: p.name, link: nextLink };
                      }),
                    }));
                  }}
                  className={cn("h-9 flex-1 sm:max-w-[507px]", fieldBorder)}
                  placeholder="https://"
                />
              </div>
            );
          })}
        </div>
      </ContentCard>

      <ContentCard>
        <h2 className="mb-4 text-[14px] font-medium text-[#2c2c2c]">Քարտեզ</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <span className="w-24 shrink-0 text-[12px] font-medium text-[#575757]">Վերնագիր</span>
            <Input
              value={data.mapSection.title}
              onChange={(e) => setData((d) => ({ ...d, mapSection: { ...d.mapSection, title: e.target.value } }))}
              className={cn("h-9 flex-1 sm:max-w-[507px]", fieldBorder)}
              placeholder="Map"
            />
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <span className="w-24 shrink-0 text-[12px] font-medium text-[#575757]">Կոորդինատներ</span>
            <Input
              value={data.mapSection.value}
              onChange={(e) => setData((d) => ({ ...d, mapSection: { ...d.mapSection, value: e.target.value } }))}
              className={cn("h-9 flex-1 sm:max-w-[507px]", fieldBorder)}
              placeholder="40.1772, 44.5035"
            />
          </div>
        </div>
      </ContentCard>
    </div>
  );
}

function fromApiContactUs(api: ContactUsApiResponse): ContactUsEditorState {
  const incomingLinks = Array.isArray(api.socialLinks) ? api.socialLinks : [];
  return {
    _id: api._id ?? "",
    title: ensureHyLocalized(api.title ?? {}),
    description: ensureHyLocalized(api.description ?? {}),
    notificationsEmailRow: ensureHyLocalized(api.notificationsEmailRow ?? {}),
    sections: Array.isArray(api.sections)
      ? api.sections.map((s, index) => ({
          id: `section-${index}-${Date.now()}`,
          ...(s.type === "address"
            ? { type: "address" as const, value: s.value ?? "" }
            : {
                type: "info" as const,
                title: s.title ?? "",
                phone: s.phone ?? "",
                email: s.email ?? "",
                link: s.link ?? "",
              }),
        }))
      : [],
    mapSection: {
      title: api.mapSection?.title ?? "",
      value: api.mapSection?.value ?? "",
    },
    socialLinks: SOCIAL_LINK_PRESETS.map((preset) => {
      const existing = incomingLinks.find((s) => s.type === preset.type);
      return {
        type: preset.type,
        name: preset.name,
        link: existing?.link ?? "",
      };
    }),
  };
}
