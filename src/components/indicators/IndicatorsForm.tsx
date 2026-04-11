"use client";

import React, { useEffect, useRef, useState } from "react";
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
  mapFeaturesToMetricAttributeKeys,
  mapIndicatorFormToCreateMetric,
  mapIndicatorFormToUpdateMetric,
  type IndicatorFormValues,
} from "@/components/indicators/indicator-form-schema";
import { swrKeys } from "@/lib/swr/cache-keys";
import {
  createMetric,
  fetchMetricForForm,
  patchMetric,
  publishMetric,
  uploadMetricCsv,
} from "@/services/metricsService";
import { ApiError } from "@/lib/api/api-error";
import { useIndicatorFeatures } from "@/components/indicators/indicator-features-context";
import type { IndicatorFeature } from "@/types/indicator-feature";
import type { MetricAttribute } from "@/types/metric";

const cardSurface =
  "ring-0 rounded-[10px] border-0 bg-white text-[#2c2c2c] shadow-[0_6px_14px_rgba(0,0,0,0.05)]";

export default function IndicatorsForm() {
  const { selectedFilter, resolvedTopicId, formMode } = useIndicatorFilters();
  const { features, replaceFeatures } = useIndicatorFeatures();
  const { mutate } = useSWRConfig();
  const committedRef = useRef<IndicatorFormValues>(emptyIndicatorFormValues());
  const committedFeaturesRef = useRef<IndicatorFeature[]>([]);

  const indicatorId = selectedFilter.indicator;
  const { data: loadedMetricData } = useSWR(
    indicatorId ? swrKeys.metricForm(indicatorId) : null,
    () => fetchMetricForForm(indicatorId!)
  );

  const form = useForm<IndicatorFormValues>({
    resolver: zodResolver(indicatorFormSchema),
    defaultValues: emptyIndicatorFormValues(),
  });

  const { getValues, reset, setValue } = form;
  const { isDirty, isSubmitting } = useFormState({ control: form.control });
  const [featuresDirty, setFeaturesDirty] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [csvUploading, setCsvUploading] = useState(false);

  useEffect(() => {
    if (!indicatorId) {
      const empty = emptyIndicatorFormValues();
      committedRef.current = empty;
      committedFeaturesRef.current = [];
      setFeaturesDirty(false);
      reset(empty);
      replaceFeatures([]);
      return;
    }
    if (!loadedMetricData) return;
    const metricAttributeKeys = mapFeaturesToMetricAttributeKeys(loadedMetricData.features);
    committedRef.current = {
      ...loadedMetricData.form,
      attributes: metricAttributeKeys,
    };
    committedFeaturesRef.current = loadedMetricData.features;
    setFeaturesDirty(false);
    reset(committedRef.current);
    replaceFeatures(loadedMetricData.features);
  }, [indicatorId, loadedMetricData, reset, replaceFeatures]);

  useEffect(() => {
    const nextAttributeKeys = mapFeaturesToMetricAttributeKeys(features);
    const currentAttributeKeys = getValues("attributes");
    const sameAttributeKeys = areMetricAttributeKeysEqual(currentAttributeKeys, nextAttributeKeys);
    if (!sameAttributeKeys) {
      setValue("attributes", nextAttributeKeys, { shouldDirty: true });
    }
    setFeaturesDirty(
      !areMetricAttributeKeysEqual(
        mapFeaturesToMetricAttributeKeys(committedFeaturesRef.current),
        nextAttributeKeys
      )
    );
  }, [features, getValues, setValue]);

  const submitSave = async (values: IndicatorFormValues) => {
    const metricAttributeKeys = mapFeaturesToMetricAttributeKeys(features);

    if (!resolvedTopicId) {
      toast.error("Ընտրեք բաժին, ենթախումբ և անհրաժեշտության դեպքում ենթա-ենթախումբ։");
      return;
    }
    try {
      if (formMode === "edit" && selectedFilter.indicator) {
        const patchBody = mapIndicatorFormToUpdateMetric(values, metricAttributeKeys);
        await patchMetric(selectedFilter.indicator, patchBody);
      } else {
        const createBody = mapIndicatorFormToCreateMetric(
          resolvedTopicId,
          values,
          metricAttributeKeys
        );
        await createMetric(createBody);
      }
      await mutate(swrKeys.metrics);
      await mutate(swrKeys.metricsByTopic(resolvedTopicId));
      if (selectedFilter.indicator) {
        await mutate(swrKeys.metricForm(selectedFilter.indicator));
        await mutate(swrKeys.metricCombinations(selectedFilter.indicator));
      }
      toast.success("Պահպանված է");
      const committedValues = { ...values, attributes: metricAttributeKeys };
      committedRef.current = committedValues;
      committedFeaturesRef.current = features;
      setFeaturesDirty(false);
      form.reset(committedValues);
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
      const metricAttributeKeys = mapFeaturesToMetricAttributeKeys(features);
      const committedValues = { ...values, attributes: metricAttributeKeys };
      committedRef.current = committedValues;
      committedFeaturesRef.current = features;
      setFeaturesDirty(false);
      form.reset(committedValues);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Սխալ";
      toast.error(message);
    }
  };

  const onCancel = () => {
    form.reset(committedRef.current);
    replaceFeatures(committedFeaturesRef.current);
    setFeaturesDirty(false);
  };

  const onMetricCsvSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file || !indicatorId) {
      input.value = "";
      return;
    }
    setCsvUploading(true);
    try {
      await uploadMetricCsv(indicatorId, file);
      await mutate(swrKeys.metricCombinations(indicatorId));
      toast.success("CSV-ն վերբեռնված է");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Սխալ";
      toast.error(message);
    } finally {
      input.value = "";
      setCsvUploading(false);
    }
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
            <FeaturesTable metricId={indicatorId} />
          </CardContent>
        </Card>

        <Card className={cn(cardSurface, "gap-0 py-0")}>
          <CardHeader className="gap-4 border-0 px-8 pt-8 pb-0">
            <CardTitle className="text-base font-medium text-[#2c2c2c]">
              Տվյալների Մուտքագրում
            </CardTitle>
            <CardAction>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                aria-label="Մուտքագրել CSV"
                disabled={!indicatorId || csvUploading}
                onChange={(ev) => void onMetricCsvSelected(ev)}
              />
              <button
                type="button"
                disabled={!indicatorId || csvUploading}
                className="flex cursor-pointer items-center gap-3.25 self-center disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => csvInputRef.current?.click()}
              >
                <Image src="/add.svg" width={24} height={24} alt="" />
                <span className="text-[14px] leading-3.5 font-medium text-[rgba(39,81,153,1)]">
                  {csvUploading ? "Բեռնվում է…" : "Մուտքագրել CSV"}
                </span>
              </button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-8 pt-6 pb-8">
            <ChartDataTabs metricId={indicatorId} metric={loadedMetricData?.metric} />
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
            disabled={!isDirty && !featuresDirty}
            className="h-11 min-w-[131px] rounded-lg border-[#c7c7c7] bg-white text-[#2c2c2c] hover:bg-[#fafafa] disabled:opacity-50"
            onClick={onCancel}
          >
            Չեղարկել
          </Button>
          <Button
            type="button"
            disabled={(!isDirty && !featuresDirty) || isSubmitting}
            className="h-11 min-w-[132px] rounded-lg border-transparent bg-[#282828] text-white hover:bg-[#282828]/90 disabled:opacity-50"
            onClick={() => void form.handleSubmit(submitSave, (errors) => console.log(errors))()}
          >
            Պահպանել
          </Button>
          <Button
            type="button"
            disabled
            className="h-11 min-w-[132px] rounded-lg border-transparent bg-[#004d99] text-white hover:bg-[#004d99]/90 disabled:opacity-50"
            onClick={() => void form.handleSubmit(submitPublish)()}
          >
            Հաստատել
          </Button>
        </div>
      </form>
    </Form>
  );
}

function areMetricAttributeKeysEqual(
  left: MetricAttribute[] | undefined,
  right: MetricAttribute[]
): boolean {
  const leftSafe = left ?? [];
  if (leftSafe.length !== right.length) return false;

  return leftSafe.every((entry, index) => {
    const other = right[index];
    if (!other) return false;
    if (entry.attributeId !== other.attributeId) return false;
    if (entry.valueIds.length !== other.valueIds.length) return false;
    if (!entry.valueIds.every((valueId, valueIndex) => valueId === other.valueIds[valueIndex])) {
      return false;
    }
    if (
      entry.label.hy !== other.label.hy ||
      entry.label.en !== other.label.en ||
      entry.label.ru !== other.label.ru
    ) {
      return false;
    }
    return (
      entry.secondaryLabel.hy === other.secondaryLabel.hy &&
      entry.secondaryLabel.en === other.secondaryLabel.en &&
      entry.secondaryLabel.ru === other.secondaryLabel.ru
    );
  });
}
