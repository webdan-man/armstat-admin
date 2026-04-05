"use client";

import React, { useRef, useState } from "react";
import { FileText, ImageIcon, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  MOCK_INFORMATION_CENTRE,
  type InfoCentreBlockItem,
  type InformationCentreMock,
} from "@/components/information-centre/information-centre-mock-data";
import { LangSwitcher } from "@/components/main/LangSwitcher";
import type { MainLangCode } from "@/components/main/main-mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const fieldBorder =
  "rounded-[9px] border border-[#e6e7eb] bg-white text-[14px] text-[#2c2c2c] placeholder:text-[#646464] shadow-none";

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

function ImageUploadStub() {
  return (
    <div className="flex items-end gap-4">
      <div className="flex h-[69px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded border border-[#e6e7eb] bg-[#f3f4f6]">
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

function BlockItemEditor({
  item,
  lang,
  onLangChange,
  onChange,
}: {
  item: InfoCentreBlockItem;
  lang: MainLangCode;
  onLangChange: (v: MainLangCode) => void;
  onChange: (next: InfoCentreBlockItem) => void;
}) {
  return (
    <div className="space-y-4 rounded-[9px] border border-[#dbdbdc] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[15px] font-medium text-[#2c2c2c]">{item.indexLabel}</span>
        <LangSwitcher value={lang} onChange={onLangChange} />
      </div>

      <Input
        value={item.title}
        onChange={(e) => onChange({ ...item, title: e.target.value })}
        className={cn("min-h-[61px] w-full py-2", fieldBorder)}
        placeholder="Վերնագիր"
      />

      <Textarea
        value={item.description}
        onChange={(e) => onChange({ ...item, description: e.target.value })}
        className={cn("min-h-[176px] resize-y", fieldBorder)}
        placeholder="Նկարագրություն"
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap items-end gap-4">
          <div
            className="flex size-[62px] shrink-0 items-center justify-center rounded-lg bg-[rgba(230,231,235,0.35)]"
            aria-hidden
          >
            <FileText className="size-7 text-[#575757]" />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[13px] text-[#2c2c2c]">Ֆայլ</span>
            <button
              type="button"
              className="w-fit text-left text-[13px] font-medium text-[#275199] hover:underline"
              onClick={() => toast.message("Ֆայլի վերբեռնումը կկապվի API-ի հետ։")}
            >
              Վերբեռնել
            </button>
            {item.fileName ? (
              <span className="text-[13px] text-[#2c2c2c]">{item.fileName}</span>
            ) : null}
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-1 sm:max-w-[507px] lg:flex-1">
          <span className="text-[12px] text-[#575757]">Հղում</span>
          <Input
            value={item.link}
            onChange={(e) => onChange({ ...item, link: e.target.value })}
            className={cn("h-9", fieldBorder)}
            placeholder="https://"
          />
        </div>
      </div>
    </div>
  );
}

export function InformationCentreEditor() {
  const initialJson = useRef(JSON.stringify(MOCK_INFORMATION_CENTRE));
  const [lang, setLang] = useState<MainLangCode>("am");
  const [data, setData] = useState<InformationCentreMock>(() =>
    structuredClone(MOCK_INFORMATION_CENTRE)
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
    const n = data.blocks.length + 1;
    setData((d) => ({
      ...d,
      blocks: [
        ...d.blocks,
        {
          id: `block-${Date.now()}`,
          indexLabel: n < 10 ? `0${n}` : String(n),
          title: "",
          description: "",
          fileName: "",
          link: "",
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
            keyValue={data.primary.key}
            onKeyChange={(key) =>
              setData((d) => ({ ...d, primary: { ...d.primary, key } }))
            }
            lang={lang}
            onLangChange={setLang}
          />
          <Input
            value={data.primary.heroTitle}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                primary: { ...d.primary, heroTitle: e.target.value },
              }))
            }
            className={cn("h-9", fieldBorder)}
          />
          <Input
            value={data.primary.subtitle}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                primary: { ...d.primary, subtitle: e.target.value },
              }))
            }
            className={cn("h-9", fieldBorder)}
          />
          <Textarea
            value={data.primary.body}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                primary: { ...d.primary, body: e.target.value },
              }))
            }
            className={cn("min-h-[137px] resize-y", fieldBorder)}
          />
          <ImageUploadStub />
        </div>
      </ContentCard>

      <ContentCard>
        <h2 className="mb-4 text-[14px] font-medium text-[#2c2c2c]">Վերնագրեր</h2>
        <div className="flex flex-col gap-4">
          <KeyRow
            keyValue={data.secondary.key}
            onKeyChange={(key) =>
              setData((d) => ({ ...d, secondary: { ...d.secondary, key } }))
            }
            lang={lang}
            onLangChange={setLang}
          />
          <Input
            value={data.secondary.title}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                secondary: { ...d.secondary, title: e.target.value },
              }))
            }
            className={cn("h-9", fieldBorder)}
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
            <BlockItemEditor
              key={block.id}
              item={block}
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
    </div>
  );
}
