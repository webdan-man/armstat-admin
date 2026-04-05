"use client";

import React, { useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import {
  CONTACT_TYPE_LABEL,
  MOCK_CONTACT_US,
  type ContactUsBlock,
  type ContactUsBlockType,
  type ContactUsMock,
} from "@/components/contact-us/contact-us-mock-data";
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

const fieldBorder =
  "rounded-[9px] border border-[#e6e7eb] bg-white text-[14px] text-[#2c2c2c] placeholder:text-[#646464] shadow-none";

const selectTypeClass =
  "h-9 w-full max-w-[249px] rounded-[9px] border-[#c8c8c8] bg-white text-[13px] text-[#2c2c2c] shadow-none";

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

function KeyRow({
  keyValue,
  onKeyChange,
  lang,
  onLangChange,
}: {
  keyValue: string;
  onKeyChange: (v: string) => void;
  lang: MainLangCode;
  onLangChange: (v: MainLangCode) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-[575px]">
        <span className="text-[14px] font-medium text-[#2c2c2c]">Key</span>
        <Input
          value={keyValue}
          onChange={(e) => onKeyChange(e.target.value)}
          className={cn("h-9 min-h-9", fieldBorder)}
        />
      </div>
      <LangSwitcher value={lang} onChange={onLangChange} className="sm:shrink-0" />
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

function ContactBlockCard({
  block,
  lang,
  onLangChange,
  onChange,
}: {
  block: ContactUsBlock;
  lang: MainLangCode;
  onLangChange: (v: MainLangCode) => void;
  onChange: (next: ContactUsBlock) => void;
}) {
  return (
    <div className="space-y-4 rounded-[9px] border border-[#dbdbdc] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Select
          value={block.type}
          onValueChange={(v) =>
            onChange({ ...block, type: v as ContactUsBlockType })
          }
        >
          <SelectTrigger className={selectTypeClass}>
            <SelectValue placeholder={CONTACT_TYPE_LABEL[block.type]} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="address">{CONTACT_TYPE_LABEL.address}</SelectItem>
            <SelectItem value="data">{CONTACT_TYPE_LABEL.data}</SelectItem>
            <SelectItem value="phone">{CONTACT_TYPE_LABEL.phone}</SelectItem>
          </SelectContent>
        </Select>
        <LangSwitcher value={lang} onChange={onLangChange} />
      </div>

      {block.type === "address" ? (
        <div className="flex flex-col gap-3">
          <Input
            value={block.addressShort ?? ""}
            onChange={(e) =>
              onChange({ ...block, addressShort: e.target.value })
            }
            className={cn("h-9 w-full", fieldBorder)}
            placeholder="Հասցե"
          />
          <Input
            value={block.addressFull ?? ""}
            onChange={(e) =>
              onChange({ ...block, addressFull: e.target.value })
            }
            className={cn("h-9 w-full", fieldBorder)}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Input
            value={block.departmentTitle ?? ""}
            onChange={(e) =>
              onChange({ ...block, departmentTitle: e.target.value })
            }
            className={cn("min-h-9 w-full", fieldBorder)}
          />
          <LabeledField
            label="Հեռախոս"
            value={block.phone ?? ""}
            onChange={(phone) => onChange({ ...block, phone })}
          />
          <LabeledField
            label="Հղում"
            value={block.link ?? ""}
            onChange={(link) => onChange({ ...block, link })}
          />
          <LabeledField
            label="Էլ. հասցե"
            value={block.email ?? ""}
            onChange={(email) => onChange({ ...block, email })}
          />
        </div>
      )}
    </div>
  );
}

export function ContactUsEditor() {
  const initialJson = useRef(JSON.stringify(MOCK_CONTACT_US));
  const [lang, setLang] = useState<MainLangCode>("am");
  const [data, setData] = useState<ContactUsMock>(() =>
    structuredClone(MOCK_CONTACT_US)
  );

  const dirty = JSON.stringify(data) !== initialJson.current;

  function handleSave() {
    if (!dirty) {
      toast.message("Փոփոխություններ չկան։");
      return;
    }
    initialJson.current = JSON.stringify(data);
    setData((d) => structuredClone(d));
    toast.success("Պահպանված է (մոկ)։");
  }

  function addBlock() {
    setData((d) => ({
      ...d,
      blocks: [
        ...d.blocks,
        {
          id: `c-${Date.now()}`,
          type: "address",
          addressShort: "Հասցե",
          addressFull: "",
        },
      ],
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
          disabled={!dirty}
          className={cn(
            "h-11 min-w-[256px] rounded-lg px-6 text-[13px] font-medium",
            dirty
              ? "border-0 bg-[#004d99] text-white hover:bg-[#004080]"
              : "cursor-not-allowed border-0 bg-[#ededed] text-[#8b8b8b] hover:bg-[#ededed]"
          )}
          onClick={handleSave}
        >
          Պահպանել Փոփոխությունները
        </Button>
      </div>

      <ContentCard>
        <h2 className="mb-4 text-[14px] font-medium text-[#2c2c2c]">Վերնագրեր</h2>
        <div className="flex flex-col gap-4">
          <KeyRow
            keyValue={data.key}
            onKeyChange={(key) => setData((d) => ({ ...d, key }))}
            lang={lang}
            onLangChange={setLang}
          />
          <Input
            value={data.title}
            onChange={(e) => setData((d) => ({ ...d, title: e.target.value }))}
            className={cn("h-9", fieldBorder)}
          />
          <Textarea
            value={data.body}
            onChange={(e) => setData((d) => ({ ...d, body: e.target.value }))}
            className={cn("min-h-[137px] resize-y whitespace-pre-line", fieldBorder)}
          />
        </div>
      </ContentCard>

      <ContentCard>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[14px] font-medium text-[#2c2c2c]">Վերնագրեր</h2>
          <Button
            type="button"
            variant="ghost"
            className="h-auto gap-2 p-0 text-[14px] font-medium text-[#275199] hover:bg-transparent hover:text-[#275199] hover:underline"
            onClick={addBlock}
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-[#275199] text-white">
              <Plus className="size-3.5" strokeWidth={2.5} />
            </span>
            Ավելացնել
          </Button>
        </div>
        <div className="flex flex-col gap-6">
          {data.blocks.map((block, index) => (
            <ContactBlockCard
              key={block.id}
              block={block}
              lang={lang}
              onLangChange={setLang}
              onChange={(next) =>
                setData((d) => ({
                  ...d,
                  blocks: d.blocks.map((b, i) => (i === index ? next : b)),
                }))
              }
            />
          ))}
        </div>
      </ContentCard>

      <ContentCard>
        <h2 className="mb-4 text-[14px] font-medium text-[#2c2c2c]">Քարտեզ</h2>
        <div className="flex flex-col gap-4">
          <div className="relative w-full max-w-[1028px]">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#646464]"
              aria-hidden
            />
            <Input
              value={data.map.searchQuery}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  map: { ...d.map, searchQuery: e.target.value },
                }))
              }
              className={cn("h-9 pl-10", fieldBorder)}
            />
          </div>
          <div className="overflow-hidden rounded-[30px] border border-[#e6e7eb]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.map.previewSrc}
              alt=""
              className="h-[178px] w-full max-w-[439px] object-cover"
            />
          </div>
        </div>
      </ContentCard>
    </div>
  );
}
