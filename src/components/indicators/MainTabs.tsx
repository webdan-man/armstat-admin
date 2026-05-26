"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { IndicatorFormValues } from "@/components/indicators/indicator-form-schema";

const fieldBorder =
  "h-9 rounded-[8.5px] border-[rgba(230,231,235,1)] bg-white text-sm text-[#2c2c2c] md:text-sm";

const locales = ["en", "hy", "ru"] as const;

function LocaleTabContent({ lang }: { lang: (typeof locales)[number] }) {
  const { control } = useFormContext<IndicatorFormValues>();

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
      <div className="grid grid-cols-[1fr_4fr_2fr] gap-5">
        <Label className="text-sm font-medium text-[#575757]">Աղբյուրը</Label>
        <FormField
          control={control}
          name={`link.${lang}`}
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormControl>
                <Input className={fieldBorder} placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-[1fr_3fr] gap-5">
        <Label className="text-sm font-medium text-[#575757]">Միավորը</Label>
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
  const { control } = useFormContext<IndicatorFormValues>();
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
      <IsCumulativeCheckbox />
    </div>
  );
};

export default MainTabs;
