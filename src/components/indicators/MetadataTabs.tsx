"use client";

import React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
const fieldBorder =
  "h-9 rounded-[8.5px] border-[rgba(230,231,235,1)] bg-white text-sm text-[#2c2c2c] md:text-sm";

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
      <TabsContent className="flex w-full flex-col gap-9.25" value="en">
        <div className="flex flex-col gap-2">
          <Label className="ml-4 text-sm font-medium text-[#575757]">Տեքստի մուտքագրում</Label>
          <Textarea className="h-92.5 resize-y rounded-[8px] border-[rgba(230,231,235,1)] bg-white text-sm text-[#575757] shadow-none" />
        </div>
        <div className="grid grid-cols-[1fr_4fr_2fr] gap-5">
          <Label className="text-sm font-medium text-[#575757]">Աղբյուրի հղումը՝</Label>
          <Input className={fieldBorder} placeholder="" />
        </div>
      </TabsContent>
      <TabsContent className="flex w-full flex-col gap-9.25" value="hy">
        <div className="flex flex-col gap-2">
          <Label className="ml-4 text-sm font-medium text-[#575757]">Տեքստի մուտքագրում</Label>
          <Textarea className="h-92.5 resize-y rounded-[8px] border-[rgba(230,231,235,1)] bg-white text-sm text-[#575757] shadow-none" />
        </div>
        <div className="grid grid-cols-[1fr_4fr_2fr] gap-5">
          <Label className="text-sm font-medium text-[#575757]">Աղբյուրի հղումը՝</Label>
          <Input className={fieldBorder} placeholder="" />
        </div>
      </TabsContent>
      <TabsContent className="flex w-full flex-col gap-9.25" value="ru">
        <div className="flex flex-col gap-2">
          <Label className="ml-4 text-sm font-medium text-[#575757]">Տեքստի մուտքագրում</Label>
          <Textarea className="h-92.5 resize-y rounded-[8px] border-[rgba(230,231,235,1)] bg-white text-sm text-[#575757] shadow-none" />
        </div>
        <div className="grid grid-cols-[1fr_4fr_2fr] gap-5">
          <Label className="text-sm font-medium text-[#575757]">Աղբյուրի հղումը՝</Label>
          <Input className={fieldBorder} placeholder="" />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default MetadataTabs;
