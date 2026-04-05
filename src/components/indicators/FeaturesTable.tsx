"use client";

import React, { useState } from "react";

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

function FeaturesTable() {
  const { features, startEdit, removeFeature } = useIndicatorFeatures();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const pendingDelete = deleteId ? features.find((f) => f.id === deleteId) : undefined;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[14px] leading-3.5">Անվանում</TableHead>
            <TableHead className="text-[14px] leading-3.5">Գրադարան</TableHead>
            <TableHead className="text-[14px] leading-3.5">Մակարդակ</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-[14px] text-zinc-500">
                Հատկանիշներ չկան։ Սեղմեք «Ավել Հատկանիշ»։
              </TableCell>
            </TableRow>
          ) : (
            features.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="py-5 text-[14px] leading-3.5">{row.name}</TableCell>
                <TableCell className="py-5 text-[14px] leading-3.5">{row.libraryDisplay}</TableCell>
                <TableCell className="py-5 text-[14px] leading-3.5 text-zinc-500">—</TableCell>
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

      <AlertDialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ջնջե՞լ հատկանիշը</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `«${pendingDelete.name}» կհեռացվի ցուցակից։ Այս գործողությունը չի կարելի հետ կանչել։`
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
