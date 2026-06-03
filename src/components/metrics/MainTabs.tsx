"use client";

import React, { useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { MetricFormValues } from "@/components/metrics/metric-form-schema";
import { useMetricSections } from "@/components/metrics/metric-filters-context";
import { getSectionLocalizedText } from "@/lib/section-localization";
import { isRootTopic } from "@/lib/section-topic-utils";

const fieldBorder =
  "h-9 rounded-[8.5px] border-[rgba(230,231,235,1)] bg-white text-sm text-[#2c2c2c] md:text-sm";

const locales = ["en", "hy", "ru"] as const;

function LocaleTabContent({ lang }: { lang: (typeof locales)[number] }) {
  const { control } = useFormContext<MetricFormValues>();

  return (
    <TabsContent className="flex w-full flex-col gap-5" value={lang}>
      <div className="grid grid-cols-[1fr_3fr] gap-5">
        <Label className="text-sm font-medium text-[#575757]">Անվանում</Label>
        <FormField
          control={control}
          name={`title.${lang}`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input className={`${fieldBorder} w-full`} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-[1fr_3fr] gap-5">
        <Label className="text-sm font-medium text-[#575757]">Նկարագրական տեքստ</Label>
        <FormField
          control={control}
          name={`description.${lang}`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  className="resize-y rounded-[8px] border-[rgba(230,231,235,1)] bg-white text-sm text-[#575757] shadow-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-[1fr_3fr] gap-5">
        <Label className="text-sm font-medium text-[#575757]">Աղբյուրը</Label>
        <FormField
          control={control}
          name={`link.${lang}`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input className={fieldBorder} placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-[1fr_3fr] gap-5">
        <Label className="text-sm font-medium text-[#575757]">Չափման միավոր</Label>
        <FormField
          control={control}
          name={`unit.${lang}`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input className={fieldBorder} placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </TabsContent>
  );
}

function IsCumulativeCheckbox() {
  const { control } = useFormContext<MetricFormValues>();
  return (
    <FormField
      control={control}
      name="isCumulative"
      render={({ field }) => (
        <FormItem>
          <Field orientation="horizontal">
            <FormControl>
              <Checkbox
                id="isCumulative"
                checked={field.value}
                onCheckedChange={(v) => field.onChange(v === true)}
              />
            </FormControl>
            <FieldLabel htmlFor="isCumulative">Գումարվող ցուցանիշ</FieldLabel>
          </Field>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function TopicIdSelect() {
  const { control, setValue, watch } = useFormContext<MetricFormValues>();
  const { sections } = useMetricSections();
  const topicId = watch("topicId");
  const sectionId = watch("sectionId");

  const rootTopics = useMemo(() => {
    const section = sections.find((s) => s._id === sectionId);
    return section ? section.topics.filter(isRootTopic) : [];
  }, [sections, sectionId]);

  // topicId may hold either a root topic or one of its sub-subtopics, so resolve
  // which root is selected by checking both levels.
  const selectedRootId = useMemo(() => {
    for (const root of rootTopics) {
      if (root._id === topicId) return root._id;
      if (root.subtopics?.some((s) => s._id === topicId)) return root._id;
    }
    return "";
  }, [rootTopics, topicId]);

  const childTopics = useMemo(() => {
    const topic = rootTopics.find((t) => t._id === selectedRootId);
    return topic?.subtopics ?? [];
  }, [rootTopics, selectedRootId]);

  // Only show a value here when topicId actually points at a sub-subtopic.
  const subSubtopicId = childTopics.some((c) => c._id === topicId) ? topicId : "";

  const handleSectionChange = (val: string) => {
    if (!val) {
      return;
    }
    setValue("sectionId", val, { shouldDirty: true });
    setValue("topicId", "", { shouldDirty: true });
  };

  // Selecting a topic links the metric to it directly; the sub-topic is optional and overrides it.
  const handleTopicChange = (val: string) => {
    if (!val) {
      return;
    }
    setValue("topicId", val, { shouldDirty: true });
  };

  const handleSubtopicChange = (val: string) => {
    if (!val) {
      return;
    }

    setValue("topicId", val, { shouldDirty: true });
  };

  return (
    <>
      <div className="grid grid-cols-[1fr_3fr] gap-5">
        <Label className="text-sm font-medium text-[#575757]">Բաժին</Label>
        <Select value={sectionId} onValueChange={handleSectionChange}>
          <SelectTrigger className={`${fieldBorder} w-full`}>
            <SelectValue placeholder="Ընտրեք…" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((section) => (
              <SelectItem key={section._id} value={section._id}>
                {getSectionLocalizedText(section.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-[1fr_3fr] gap-5">
        <Label className="text-sm font-medium text-[#575757]">Ենթախումբ</Label>
        <Select disabled={!sectionId} value={selectedRootId} onValueChange={handleTopicChange}>
          <SelectTrigger className={`${fieldBorder} w-full`}>
            <SelectValue placeholder="Ընտրեք…" />
          </SelectTrigger>
          <SelectContent>
            {rootTopics.map((topic) => (
              <SelectItem key={topic._id} value={topic._id}>
                {getSectionLocalizedText(topic.title)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {childTopics.length > 0 && (
        <div className="grid grid-cols-[1fr_3fr] gap-5">
          <Label className="text-sm font-medium text-[#575757]">Ենթա-ենթախումբ</Label>
          <Select value={subSubtopicId} onValueChange={handleSubtopicChange}>
            <SelectTrigger className={`${fieldBorder} w-full`}>
              <SelectValue placeholder="Ընտրեք…" />
            </SelectTrigger>
            <SelectContent>
              {childTopics.map((sub) => (
                <SelectItem key={sub._id} value={sub._id}>
                  {getSectionLocalizedText(sub.title)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <FormField
        control={control}
        name="topicId"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

const triggerClass =
  "h-8 min-w-[64px] rounded-lg px-2 py-0 text-[13px] font-normal text-black hover:bg-white/50 group-data-[variant=default]/tabs-list:data-[state=active]:bg-white group-data-[variant=default]/tabs-list:data-[state=active]:border-b-0 data-[state=active]:shadow-[0px_4px_4px_0px_rgba(0,0,0,0.05)]";

const MainTabs = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex w-full flex-col gap-5", className)}>
      <Tabs defaultValue="hy" className="w-full gap-5">
        <TabsList className="h-9 gap-0 rounded-[9px] bg-[#e6e7eb] p-0.5">
          <TabsTrigger value="hy" className={triggerClass}>
            HY
          </TabsTrigger>
          <TabsTrigger value="ru" className={triggerClass}>
            RU
          </TabsTrigger>
          <TabsTrigger value="en" className={triggerClass}>
            ENG
          </TabsTrigger>
        </TabsList>
        {locales.map((lang) => (
          <LocaleTabContent key={lang} lang={lang} />
        ))}
      </Tabs>
      <TopicIdSelect />
      <IsCumulativeCheckbox />
    </div>
  );
};

export default MainTabs;
