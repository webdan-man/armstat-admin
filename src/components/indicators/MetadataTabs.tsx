"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { IndicatorFormValues } from "@/components/indicators/indicator-form-schema";

const fieldBorder =
  "h-9 rounded-[8.5px] border-[rgba(230,231,235,1)] bg-white text-sm text-[#2c2c2c] md:text-sm";

const locales = ["en", "hy", "ru"] as const;

function MetadataLocaleContent({ lang }: { lang: (typeof locales)[number] }) {
  const { control } = useFormContext<IndicatorFormValues>();

  return (
    <TabsContent className="flex w-full flex-col gap-9.25" value={lang}>
      <div className="flex flex-col gap-2">
        <Label className="ml-4 text-sm font-medium text-[#575757]">Տեքստի մուտքագրում</Label>
        <FormField
          control={control}
          name={`metadata.${lang}.body`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  className="h-92.5 resize-y rounded-[8px] border-[rgba(230,231,235,1)] bg-white text-sm text-[#575757] shadow-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-[1fr_4fr_2fr] gap-5">
        <Label className="text-sm font-medium text-[#575757]">Աղբյուրի հղումը՝</Label>
        <FormField
          control={control}
          name={`metadata.${lang}.sourceUrl`}
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
    </TabsContent>
  );
}

const MetadataTabs = ({ className }: { className?: string }) => {
  return (
    <Tabs defaultValue="hy" className={cn("w-full gap-5", className)}>
      <TabsList className="h-9 gap-0 rounded-[9px] bg-[#e6e7eb] p-0.5">
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
        <MetadataLocaleContent key={lang} lang={lang} />
      ))}
    </Tabs>
  );
};

export default MetadataTabs;
