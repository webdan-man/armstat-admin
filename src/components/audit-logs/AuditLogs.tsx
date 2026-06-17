"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AuditLog } from "@/types/audit-logs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AuditLogInfo from "@/components/audit-logs/AuditLogInfo";
import { format } from "date-fns";
import useSWR from "swr";
import { getAuditLogs } from "@/services/auditLogsService";
import { Loader2 } from "lucide-react";

const PAGE_SIZE = 20;

function PaginationButton({
  onClick,
  disabled,
  active,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex h-9 min-w-9 items-center justify-center rounded-sm border px-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40",
        active
          ? "bg-link border-blue600 border-2 text-white"
          : "border-textBlack300 text-textBlack700 hover:bg-gray-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function AuditLogs() {
  const [selectedItem, setSelectedItem] = useState<AuditLog>();
  const [page, setPage] = useState(1);

  const result = useSWR(["/api/audit-logs", page], () =>
    getAuditLogs({ page, limit: PAGE_SIZE })
  );

  const total = result.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  // Window the page buttons around the current page so large logs don't render
  // hundreds of buttons. "..." marks a gap to the first/last page.
  const pageNumbers: (number | "...")[] = (() => {
    const window = 2;
    const pages = new Set<number>([1, totalPages]);
    for (let p = page - window; p <= page + window; p++) {
      if (p >= 1 && p <= totalPages) pages.add(p);
    }
    const sorted = [...pages].sort((a, b) => a - b);
    const result: (number | "...")[] = [];
    let prev = 0;
    for (const p of sorted) {
      if (prev && p - prev > 1) result.push("...");
      result.push(p);
      prev = p;
    }
    return result;
  })();

  const thClass = "bg-background sticky top-0 z-20";

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-11 flex min-h-11 flex-col gap-4 bg-[#f9fafb] px-11 pt-7 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl leading-6 font-medium text-[#2c2c2c]">Աուդիտ լոգեր</h1>
        <div className="flex justify-start gap-2 pt-4 pb-4">
          <Button
            onClick={() => {
              window.location.href = "/api/audit-logs/download";
            }}
          >
            Արտահանել
          </Button>
        </div>
      </div>

      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={thClass}>ID</TableHead>
              <TableHead className={thClass}>Էլ. հասցե</TableHead>
              <TableHead className={thClass}>Ամսաթիվ</TableHead>
              <TableHead className={thClass}>Գործողություն</TableHead>
              <TableHead className={thClass}></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {result?.data?.data.map((item: AuditLog) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.actorUser?.email}</TableCell>
                <TableCell>{format(new Date(item.createdAt), "d MMMM yyyy HH:mm")}</TableCell>

                <TableCell>{item.action}</TableCell>

                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedItem(item)}
                    className="mr-2"
                  >
                    Մանրամասն
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {result.isLoading && (
          <div className="flex w-full justify-center py-2">
            <Loader2 className="size-13 animate-spin" />
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <PaginationButton onClick={() => goTo(page - 1)} disabled={page === 1}>
            ‹
          </PaginationButton>

          {pageNumbers.map((n, i) =>
            n === "..." ? (
              <span key={`ellipsis-${i}`} className="text-textBlack700 px-1">
                …
              </span>
            ) : (
              <PaginationButton key={n} onClick={() => goTo(n)} active={n === page}>
                {n}
              </PaginationButton>
            )
          )}

          <PaginationButton onClick={() => goTo(page + 1)} disabled={page === totalPages}>
            ›
          </PaginationButton>
        </div>
      )}
      <AlertDialog open={!!selectedItem}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Աուդիտ լոգ {selectedItem?.id}</AlertDialogTitle>
            {!!selectedItem && <AuditLogInfo auditLog={selectedItem} />}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSelectedItem(undefined)}>Փակել</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
