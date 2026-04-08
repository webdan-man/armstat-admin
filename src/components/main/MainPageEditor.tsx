"use client";

import React, { useRef, useState } from "react";
import { ImageIcon, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { LangSwitcher } from "@/components/main/LangSwitcher";
import {
  MOCK_MAIN_PAGE,
  type MainHomeBlock,
  type MainLangCode,
  type MainPageMock,
} from "@/components/main/main-mock-data";
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
        <div className="flex min-w-0 items-center gap-3">
          <Input
            value={keyValue}
            onChange={(e) => onKeyChange(e.target.value)}
            className={cn("h-9 min-h-9 flex-1", fieldBorder)}
          />
        </div>
      </div>
      <LangSwitcher value={lang} onChange={onLangChange} className="sm:shrink-0" />
    </div>
  );
}

function TagChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="flex h-9 max-w-full items-center gap-2 rounded-[9px] bg-[#eff0f2] pl-3 pr-1 text-[13px] text-[#2c2c2c]">
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

function BlockCard({
  block,
  lang,
  onLangChange,
  onChange,
}: {
  block: MainHomeBlock;
  lang: MainLangCode;
  onLangChange: (v: MainLangCode) => void;
  onChange: (next: MainHomeBlock) => void;
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
        <KeyRow
          keyValue={block.key}
          onKeyChange={(key) => onChange({ ...block, key })}
          lang={lang}
          onLangChange={onLangChange}
        />

        <Input
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          className={cn("h-9", fieldBorder)}
        />

        <Input
          value={block.subtitle}
          onChange={(e) => onChange({ ...block, subtitle: e.target.value })}
          className={cn("min-h-[35px]", fieldBorder)}
        />

        <Select>
          <SelectTrigger
            className={cn(
              "h-9 w-full max-w-[306px] sm:w-[306px]",
              fieldBorder,
              "text-[#2c2c2c]"
            )}
          >
            <SelectValue placeholder={block.categoryPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="c1">Կատեգորիա 1</SelectItem>
            <SelectItem value="c2">Կատեգորիա 2</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-3">
          {block.tags.map((tag, i) => (
            <TagChip
              key={`${block.id}-tag-${i}`}
              label={tag}
              onRemove={() =>
                onChange({
                  ...block,
                  tags: block.tags.filter((_, j) => j !== i),
                })
              }
            />
          ))}
        </div>

        <UploadStub compact />
      </div>
    </ContentCard>
  );
}

export function MainPageEditor() {
  const initialJson = useRef(JSON.stringify(MOCK_MAIN_PAGE));
  const [lang, setLang] = useState<MainLangCode>("hy");
  const [data, setData] = useState<MainPageMock>(() =>
    structuredClone(MOCK_MAIN_PAGE)
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

  return (
    <div className="flex w-full flex-col gap-5 pb-10">
      <div className="flex min-h-11 w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl leading-6 font-medium text-[#2c2c2c]">
          Գլխավոր էջի Փոփոխություններ
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
            keyValue={data.headers.key}
            onKeyChange={(key) =>
              setData((d) => ({ ...d, headers: { ...d.headers, key } }))
            }
            lang={lang}
            onLangChange={setLang}
          />
          <Input
            value={data.headers.title}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                headers: { ...d.headers, title: e.target.value },
              }))
            }
            className={cn("h-9", fieldBorder)}
          />
          <Textarea
            value={data.headers.description}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                headers: { ...d.headers, description: e.target.value },
              }))
            }
            className={cn("min-h-[70px] resize-y", fieldBorder)}
          />
          <UploadStub />
        </div>
      </ContentCard>

      {data.blocks.map((block, index) => (
        <BlockCard
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

      <ContentCard>
        <h2 className="mb-4 text-[14px] font-medium text-[#2c2c2c]">Նորություններ</h2>
        <div className="flex flex-col gap-4">
          <KeyRow
            keyValue={data.news.key}
            onKeyChange={(key) =>
              setData((d) => ({ ...d, news: { ...d.news, key } }))
            }
            lang={lang}
            onLangChange={setLang}
          />
          <Select>
            <SelectTrigger className={cn("h-9 w-full", fieldBorder)}>
              <SelectValue placeholder={data.news.placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="n1">Նորություն 1</SelectItem>
              <SelectItem value="n2">Նորություն 2</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-3">
            {data.news.selectedTitles.map((title, i) => (
              <TagChip
                key={`news-${i}`}
                label={title}
                onRemove={() =>
                  setData((d) => ({
                    ...d,
                    news: {
                      ...d.news,
                      selectedTitles: d.news.selectedTitles.filter((_, j) => j !== i),
                    },
                  }))
                }
              />
            ))}
          </div>
        </div>
      </ContentCard>

      <ContentCard>
        <h2 className="mb-4 text-[14px] font-medium text-[#2c2c2c]">Գովազդային Բաժին</h2>
        <div className="flex flex-col gap-4">
          <KeyRow
            keyValue={data.ad.key}
            onKeyChange={(key) =>
              setData((d) => ({ ...d, ad: { ...d.ad, key } }))
            }
            lang={lang}
            onLangChange={setLang}
          />
          <Input
            value={data.ad.title}
            onChange={(e) =>
              setData((d) => ({ ...d, ad: { ...d.ad, title: e.target.value } }))
            }
            className={cn("h-9", fieldBorder)}
          />
          <Textarea
            value={data.ad.description}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                ad: { ...d.ad, description: e.target.value },
              }))
            }
            className={cn("min-h-[70px] resize-y", fieldBorder)}
          />
          <UploadStub />
        </div>
      </ContentCard>

      <ContentCard>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[14px] font-medium text-[#2c2c2c]">Օգտակար հղումներ</h2>
          <Button
            type="button"
            variant="ghost"
            className="h-auto gap-2 p-0 text-[14px] font-medium text-[#275199] hover:bg-transparent hover:text-[#275199] hover:underline"
            onClick={() =>
              setData((d) => ({
                ...d,
                usefulLinks: {
                  ...d.usefulLinks,
                  links: [
                    ...d.usefulLinks.links,
                    {
                      id: `l-${Date.now()}`,
                      title: "Վերնագրիրը այստեղ",
                    },
                  ],
                },
              }))
            }
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-[#275199] text-white">
              <Plus className="size-3.5" strokeWidth={2.5} />
            </span>
            Ավելացնել
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          <KeyRow
            keyValue={data.usefulLinks.key}
            onKeyChange={(key) =>
              setData((d) => ({
                ...d,
                usefulLinks: { ...d.usefulLinks, key },
              }))
            }
            lang={lang}
            onLangChange={setLang}
          />
          <div className="flex flex-col gap-3">
            {data.usefulLinks.links.map((link) => (
              <div
                key={link.id}
                className="flex min-h-[54px] items-center justify-between gap-4 rounded-[9px] bg-[#f8f8f8] px-4 py-3"
              >
                <span className="min-w-0 flex-1 text-[13px] text-[#1a1a1a]">
                  {link.title}
                </span>
                <div className="flex shrink-0 items-center gap-6">
                  <button
                    type="button"
                    className="text-[13px] font-medium text-[#275199] hover:underline"
                    onClick={() => toast.message("Խմբագրումը կկապվի API-ի հետ։")}
                  >
                    Խմբագրել
                  </button>
                  <button
                    type="button"
                    className="text-[13px] font-medium text-[#c00] hover:underline"
                    onClick={() =>
                      setData((d) => ({
                        ...d,
                        usefulLinks: {
                          ...d.usefulLinks,
                          links: d.usefulLinks.links.filter((l) => l.id !== link.id),
                        },
                      }))
                    }
                  >
                    Ջնջել
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ContentCard>
    </div>
  );
}
