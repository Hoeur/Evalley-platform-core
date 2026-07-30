"use client";

import { useState } from "react";
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState, type VisibilityState } from "@tanstack/react-table";
import { cn } from "@/core/utils/cn";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/design-system/ui/table";
import { EmptyState } from "@/components/feedback/empty-state";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableViewOptions } from "./data-table-view-options";

type ColumnPresentation = { className?: string; headerClassName?: string };

export function DataTable<TData, TValue>({ columns, data, total = data.length, entityName = "item", page, pageCount, limit, toolbar, bulkActions }: { columns: ColumnDef<TData, TValue>[]; data: TData[]; total?: number; entityName?: string; page: number; pageCount: number; limit: number; toolbar?: React.ReactNode; bulkActions?: (selectedRows: TData[]) => React.ReactNode }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [visibility, setVisibility] = useState<VisibilityState>({});
  const [selection, setSelection] = useState({});
  // TanStack Table intentionally returns dynamic functions that React Compiler does not memoize.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data, columns, state: { sorting, columnVisibility: visibility, rowSelection: selection }, onSortingChange: setSorting, onColumnVisibilityChange: setVisibility, onRowSelectionChange: setSelection, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), enableRowSelection: true });
  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);

  return <div className="overflow-hidden rounded-2xl border bg-card shadow-sm"><div className="border-b p-4"><div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div className="min-w-0 flex-1">{toolbar}</div><DataTableViewOptions table={table} /></div></div>{selectedRows.length > 0 && <div className="flex flex-col gap-3 border-b border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-medium">{selectedRows.length} {entityName}{selectedRows.length === 1 ? "" : "s"} selected</p><div className="flex items-center gap-2">{bulkActions?.(selectedRows)}</div></div>}<div className="overflow-x-auto"><Table><TableHeader className="bg-muted/45">{table.getHeaderGroups().map((group) => <TableRow key={group.id} className="hover:bg-transparent">{group.headers.map((header) => { const meta = header.column.columnDef.meta as ColumnPresentation | undefined; return <TableHead key={header.id} className={cn("h-11 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground", meta?.headerClassName)}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>; })}</TableRow>)}</TableHeader><TableBody>{table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="h-[72px] hover:bg-primary/[0.035] data-[state=selected]:bg-primary/[0.06]">{row.getVisibleCells().map((cell) => { const meta = cell.column.columnDef.meta as ColumnPresentation | undefined; return <TableCell key={cell.id} className={cn("px-4 py-3", meta?.className)}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>; })}</TableRow>) : <TableRow><TableCell colSpan={columns.length} className="p-0"><EmptyState title={`No ${entityName}s found`} description="Try changing or resetting the current catalog filters." /></TableCell></TableRow>}</TableBody></Table></div><DataTablePagination page={page} pageCount={pageCount} limit={limit} total={total} entityName={entityName} selectedCount={selectedRows.length} /></div>;
}
