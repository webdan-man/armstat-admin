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

export default function AuditLogs() {
    const [selectedItem, setSelectedItem] = useState<AuditLog>();

    const result = useSWR("/api/audit-logs", () => getAuditLogs());

    const thClass = "bg-background sticky top-0 z-20";

    return (
        <div>
            <h1 className='mb-4 text-2xl font-bold'>Աուդիտ լոգեր</h1>

            <div className='flex justify-start gap-2 pt-4 pb-4'>
                <Button
                    onClick={() => {
                        window.location.href = "/api/audit-logs/download";
                    }}
                >
                    Արտահանել
                </Button>
            </div>

            <div className='h-[calc(100vh-164px)] w-full overflow-y-auto'>
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
                                <TableCell>
                                    {format(new Date(item.createdAt), "d MMMM yyyy HH:mm")}
                                </TableCell>

                                <TableCell>{item.action}</TableCell>

                                <TableCell>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => setSelectedItem(item)}
                                        className='mr-2'
                                    >
                                        Մանրամասն
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {result.isLoading && (
                    <div className='flex w-full justify-center py-2'>
                        <Loader2 className='size-13 animate-spin' />
                    </div>
                )}
            </div>
            <AlertDialog open={!!selectedItem}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Աուդիտ լոգ {selectedItem?.id}</AlertDialogTitle>
                        {!!selectedItem && <AuditLogInfo auditLog={selectedItem} />}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setSelectedItem(undefined)}>
                            Փակել
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
