"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useIndicatorFeatures } from "@/components/indicators/indicator-features-context";
import { fetchAttributeCategories, getLibraryFromAttributeById } from "@/services/attributeService";
import type { Attribute } from "@/types/attribute";
import { swrKeys } from "@/lib/swr/cache-keys";
import { Button } from "@/components/ui/button";
import { downloadMetricCombinationsCSV } from "@/services/metricsService";

function FeaturesTable({ metricId }: { metricId: string }) {
  const { features, startEdit, removeFeature } = useIndicatorFeatures();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: attributesCategories = [] } = useSWR(
    swrKeys.attributesCategories,
    fetchAttributeCategories
  );
  const selectedAttributeKeys = useMemo(
    () =>
      Array.from(
        new Set(
          features
            .map((feature) => feature.attributeKey)
            .filter((attributeKey) => Boolean(attributeKey))
        )
      ),
    [features]
  );
  const detailsKey = useMemo(
    () =>
      selectedAttributeKeys.length > 0
        ? ([swrKeys.attributes, "features-table-details", ...selectedAttributeKeys] as const)
        : null,
    [selectedAttributeKeys]
  );
  const { data: attributeByKey = {} } = useSWR<Record<string, Attribute | null>>(
    detailsKey,
    async () => {
      const entries = await Promise.all(
        selectedAttributeKeys.map(async (key) => {
          try {
            const attribute = await getLibraryFromAttributeById(key);
            return [key, attribute] as const;
          } catch {
            return [key, null] as const;
          }
        })
      );
      return Object.fromEntries(entries);
    }
  );

  const resolveAttributeLabel = (row: (typeof features)[number]): string => {
    const attribute = attributeByKey[row.attributeKey];
    const translated = attribute?.title?.hy?.trim();
    if (translated) return translated;
    const keyFallback = attribute?._id?.trim();
    if (keyFallback) return keyFallback;
    if (row.attributeKeyLabel) return row.attributeKeyLabel;
    return row.attributeKey;
  };

  const resolveCategoryLabel = (row: (typeof features)[number]): string => {
    const attributeCategory = attributeByKey[row.attributeKey]?.category?.trim();
    const attributeTitle = attributesCategories
      .find((item) => item.value === attributeCategory)
      ?.title?.hy?.trim();
    if (attributeTitle) return attributeTitle;
    return "—";
  };

  const resolveLibraryValues = (row: (typeof features)[number]): string => {
    const attribute = attributeByKey[row.attributeKey];
    if (!attribute) return row.libraryDisplay || "—";
    if (!row.valueIds?.length) return row.libraryDisplay || "—";

    const labels = row.valueIds.map((valueId) => {
      const option = attribute.values.find((value) => value._id === valueId);
      if (!option) return valueId;
      return option.title?.hy?.trim() || option._id || valueId;
    });

    const joined = labels.filter(Boolean).join(", ");
    return joined || row.libraryDisplay || "—";
  };

  const pendingDelete = deleteId ? features.find((f) => f.id === deleteId) : undefined;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[14px] leading-3.5">Տեսակ</TableHead>
            <TableHead className="text-[14px] leading-3.5">Գրադարան</TableHead>
            <TableHead className="text-[14px] leading-3.5">Մակարդակ</TableHead>
            <TableHead className="text-[14px] leading-3.5">Գրադարան Արժեքներ</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-[14px] text-zinc-500">
                Հատկանիշներ չկան։ Սեղմեք «Ավել Հատկանիշ»։
              </TableCell>
            </TableRow>
          ) : (
            features.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="py-5 text-[14px] leading-3.5">
                  {resolveCategoryLabel(row)}
                </TableCell>
                <TableCell className="py-5 text-[14px] leading-3.5">
                  {resolveAttributeLabel(row)}
                </TableCell>
                <TableCell className="py-5 text-[14px] leading-3.5">
                  {row.level === "primary" ? "Հիմնական" : "Երկրորդային"}
                </TableCell>
                <TableCell className="max-w-[340px] py-5 text-[14px] leading-3.5 break-words">
                  {resolveLibraryValues(row)}
                </TableCell>
                <TableCell className="py-5">
                  <div className="flex h-full w-full items-center justify-end gap-6.75">
                    <button
                      type="button"
                      className="text-[13px] leading-3.5 text-[rgba(39,81,153,1)] transition-all duration-300 hover:underline"
                      onClick={() => startEdit(row.id)}
                    >
                      Խմբագրել
                    </button>
                    <button
                      type="button"
                      className="text-[13px] leading-3.5 text-[rgba(204,0,0,1)] transition-all duration-300 hover:underline"
                      onClick={() => setDeleteId(row.id)}
                    >
                      Ջնջել
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div>
        <Button size="lg" onClick={() => downloadMetricCombinationsCSV(metricId)}>
          Գեներացնել CSV
        </Button>
      </div>

      <AlertDialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ջնջե՞լ հատկանիշը</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `«${resolveAttributeLabel(pendingDelete)}» կհեռացվի ցուցակից։ Այս գործողությունը չի կարելի հետ կանչել։`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Չեղարկել</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[rgba(204,0,0,1)] text-white hover:bg-[rgba(204,0,0,0.9)]"
              onClick={() => {
                if (deleteId) removeFeature(deleteId);
                setDeleteId(null);
              }}
            >
              Ջնջել
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default React.memo(FeaturesTable);
