"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Field, FieldLabel } from "@/components/ui/field";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const ChartDataTabs = ({ className }: { className?: string }) => {
  const { control } = useFormContext<IndicatorFormValues>();

  return (
    <Tabs defaultValue="graph" className={cn("w-full gap-5", className)}>
      <TabsList className="flex h-11.75 w-full justify-start gap-0 rounded-none border-b border-b-[rgba(178,178,178,1)] bg-transparent p-0.5">
        <TabsTrigger
          value="graph"
          className="h-11.75 max-w-fit rounded-none border-b-2 border-b-transparent px-4 data-[state=active]:border-b-[rgba(15,104,192,1)] data-[state=active]:bg-[rgba(241,245,248,1)] data-[state=active]:shadow-none"
        >
          Գծապատկեր
        </TabsTrigger>
        <TabsTrigger
          value="table"
          className="h-11.75 max-w-fit rounded-none border-b-2 border-b-transparent px-4 data-[state=active]:border-b-[rgba(15,104,192,1)] data-[state=active]:bg-[rgba(241,245,248,1)] data-[state=active]:shadow-none"
        >
          Տվյալներ
        </TabsTrigger>
      </TabsList>
      <TabsContent className="flex w-full flex-col gap-10" value="graph">
        <div className="flex flex-col gap-6">
          <p className="text-[14px] leading-3.5 font-medium text-[rgba(44,44,44,1)]">Գրաֆիկ 1</p>
          <div className="h-50"></div>
          <FormField
            control={control}
            name="charts.0.link"
            render={({ field }) => (
              <FormItem>
                <Field orientation="horizontal">
                  <FieldLabel>Link</FieldLabel>
                  <FormControl>
                    <Input className={fieldBorder} {...field} />
                  </FormControl>
                </Field>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-[14px] leading-3.5 font-medium text-[rgba(44,44,44,1)]">Գրաֆիկ 2</p>
          <div className="h-50"></div>
          <FormField
            control={control}
            name="charts.1.link"
            render={({ field }) => (
              <FormItem>
                <Field orientation="horizontal">
                  <FieldLabel>Link</FieldLabel>
                  <FormControl>
                    <Input className={fieldBorder} {...field} />
                  </FormControl>
                </Field>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </TabsContent>
      <TabsContent className="flex w-full flex-col gap-5" value="table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[14px] leading-3.5">Ժամանակային Շարք</TableHead>
              <TableHead className="text-[14px] leading-3.5">Տարիք</TableHead>
              <TableHead className="text-[14px] leading-3.5">Մարզեր</TableHead>
              <TableHead className="text-[14px] leading-3.5">Սեռ</TableHead>
              <TableHead className="text-[14px] leading-3.5">Քանակ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody></TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  );
};

export default ChartDataTabs;
