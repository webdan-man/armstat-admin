"use client";

import React, { useEffect, useRef } from "react";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import Image from "next/image";
import CreateWindow from "@/components/indicators/CreateWindow";
import MainTabs from "@/components/indicators/MainTabs";
import MetadataTabs from "@/components/indicators/MetadataTabs";
import ChartDataTabs from "@/components/indicators/ChartDataTabs";
import FeaturesTable from "@/components/indicators/FeaturesTable";
import { useIndicatorFilters } from "@/components/indicators/indicator-filters-context";
import {
  emptyIndicatorFormValues,
  indicatorFormSchema,
  mapIndicatorFormToCreateMetric,
  type IndicatorFormValues,
} from "@/components/indicators/indicator-form-schema";
import { swrKeys } from "@/lib/swr/cache-keys";
import {
  createMetric,
  fetchMetricForForm,
  publishMetric,
} from "@/services/metricsService";
import { ApiError } from "@/lib/api/api-error";

const cardSurface =
  "ring-0 rounded-[10px] border-0 bg-white text-[#2c2c2c] shadow-[0_6px_14px_rgba(0,0,0,0.05)]";

export default function IndicatorsForm() {
  const { selectedFilter, resolvedTopicId } = useIndicatorFilters();
  const { mutate } = useSWRConfig();
  const committedRef = useRef<IndicatorFormValues>(emptyIndicatorFormValues());

  const indicatorId = selectedFilter.indicator;
  const { data: loadedForm } = useSWR(
    indicatorId ? swrKeys.metricForm(indicatorId) : null,
    () => fetchMetricForForm(indicatorId!)
  );

  const form = useForm<IndicatorFormValues>({
    resolver: zodResolver(indicatorFormSchema),
    defaultValues: emptyIndicatorFormValues(),
  });

  const { reset } = form;
  const { isDirty, isSubmitting } = useFormState({ control: form.control });

  useEffect(() => {
    if (!indicatorId) {
      const empty = emptyIndicatorFormValues();
      committedRef.current = empty;
      reset(empty);
      return;
    }
    if (!loadedForm) return;
    committedRef.current = loadedForm;
    reset(loadedForm);
  }, [indicatorId, loadedForm, reset]);

  const submitSave = async (values: IndicatorFormValues) => {
    if (!resolvedTopicId) {
      toast.error("Ընտրեք բաժին, ենթախումբ և անհրաժեշտության դեպքում ենթա-ենթախումբ։");
      return;
    }

    try {
      const body = mapIndicatorFormToCreateMetric(resolvedTopicId, values);
      await createMetric(body);
      await mutate(swrKeys.metrics);
      if (selectedFilter.indicator) {
        await mutate(swrKeys.metricForm(selectedFilter.indicator));
      }
      toast.success("Պահպանված է");
      committedRef.current = values;
      form.reset(values);
    } catch (e) {
      const message = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Սխալ";
      toast.error(message);
    }
  };

  const submitPublish = async (values: IndicatorFormValues) => {
    if (!selectedFilter.indicator) {
      toast.error("Ընտրեք ցուցանիշ։");
      return;
    }
    try {
      await publishMetric(selectedFilter.indicator);
      await mutate(swrKeys.metrics);
      await mutate(swrKeys.metricForm(selectedFilter.indicator));
      toast.success("Հրապարակված է");
      committedRef.current = values;
      form.reset(values);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Սխալ";
      toast.error(message);
    }
  };

  const onCancel = () => {
    form.reset(committedRef.current);
  };

  return (
    <Form {...form}>
      <form
        id="indicator-form"
        className="mt-7.5 flex w-full flex-col gap-7.5"
        onSubmit={(e) => e.preventDefault()}
      >
        <Card className={cn(cardSurface, "gap-0 py-0")}>
          <CardHeader className="gap-4 border-0 px-8 pt-8 pb-0">
            <CardTitle className="text-base font-medium text-[#2c2c2c]">Վերնագրեր</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-8 pt-6 pb-8">
            <MainTabs />
          </CardContent>
        </Card>

        <Card className={cn(cardSurface, "gap-0 py-0")}>
          <CardHeader className="gap-4 border-0 px-8 pt-8 pb-0">
            <CardTitle className="text-base font-medium text-[#2c2c2c]">Հատկանիշներ</CardTitle>
            <CardAction>
              <CreateWindow />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-8 pt-6 pb-8">
            <FeaturesTable />
          </CardContent>
        </Card>

        <Card className={cn(cardSurface, "gap-0 py-0")}>
          <CardHeader className="gap-4 border-0 px-8 pt-8 pb-0">
            <CardTitle className="text-base font-medium text-[#2c2c2c]">
              Տվյալների Մուտքագրում
            </CardTitle>
            <CardAction>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-3.25 self-center"
              >
                <Image src="/add.svg" width={24} height={24} alt="" />
                <span className="text-[14px] leading-3.5 font-medium text-[rgba(39,81,153,1)]">
                  Մուտքագրել CSV
                </span>
              </button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-8 pt-6 pb-8">
            <ChartDataTabs />
          </CardContent>
        </Card>

        <Card className={cn(cardSurface, "gap-0 py-0")}>
          <CardHeader className="gap-4 border-0 px-8 pt-8 pb-0">
            <CardTitle className="text-base font-medium text-[#2c2c2c]">Մետատվյալներ</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-8 pt-6 pb-8">
            <MetadataTabs />
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={!isDirty}
            className="h-11 min-w-[131px] rounded-lg border-[#c7c7c7] bg-white text-[#2c2c2c] hover:bg-[#fafafa] disabled:opacity-50"
            onClick={onCancel}
          >
            Չեղարկել
          </Button>
          <Button
            type="button"
            disabled={!isDirty || isSubmitting}
            className="h-11 min-w-[132px] rounded-lg border-transparent bg-[#282828] text-white hover:bg-[#282828]/90 disabled:opacity-50"
            onClick={() => void form.handleSubmit(submitSave)()}
          >
            Հաստատել
          </Button>
          <Button
            type="button"
            disabled
            className="h-11 min-w-[132px] rounded-lg border-transparent bg-[#004d99] text-white hover:bg-[#004d99]/90 disabled:opacity-50"
            onClick={() => void form.handleSubmit(submitPublish)()}
          >
            Պահպանել
          </Button>
        </div>
      </form>
    </Form>
  );
}
