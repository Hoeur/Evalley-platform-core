"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Filter, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/page/page-container";
import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/design-system/ui/button";
import { Card, CardContent } from "@/design-system/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/design-system/ui/dialog";
import { Input } from "@/design-system/ui/input";
import { Label } from "@/design-system/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/design-system/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/design-system/ui/table";
import { cn } from "@/core/utils/cn";
import type { WorkspaceConfig, WorkspaceRow } from "../types";

function statusVariant(value: string) {
  const normalized = value.toLowerCase();
  if (["active", "approved", "completed", "delivered", "paid", "refunded", "in stock", "vip"].some((item) => normalized.includes(item))) return "success" as const;
  if (["pending", "requested", "reorder", "low stock", "processing", "yes"].some((item) => normalized.includes(item))) return "warning" as const;
  if (["failed", "refused", "suspended", "canceled", "out of stock"].some((item) => normalized.includes(item))) return "danger" as const;
  return "neutral" as const;
}

export function DataWorkspace({ config }: { config: WorkspaceConfig }) {
  const [rows, setRows] = useState(config.rows);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const statuses = useMemo(() => [...new Set(rows.map((row) => row.status).filter(Boolean))] as string[], [rows]);
  const visibleRows = useMemo(() => rows.filter((row) => {
    const matchesSearch = !query || Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(query.toLowerCase()));
    return matchesSearch && (status === "all" || row.status === status);
  }), [query, rows, status]);

  function exportCsv() {
    const header = config.columns.map((column) => column.label);
    const lines = visibleRows.map((row) => config.columns.map((column) => JSON.stringify(row[column.key] ?? "")).join(","));
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${config.title.toLowerCase().replaceAll(" ", "-")}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("CSV export created");
  }

  function addRow() {
    if (!newName.trim()) return;
    const firstColumn = config.columns[0];
    const row: WorkspaceRow = { id: `local-${Date.now()}`, [firstColumn.key]: newName.trim(), status: "Draft" };
    for (const column of config.columns.slice(1)) if (!(column.key in row)) row[column.key] = "—";
    setRows((current) => [row, ...current]);
    setNewName("");
    setDialogOpen(false);
    toast.success(`${config.primaryAction} saved locally`);
  }

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="font-heading text-xl font-bold tracking-tight">{config.title}</h1><p className="mt-1 text-xs text-muted-foreground">{config.description}</p></div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9 rounded-[10px] text-xs" onClick={exportCsv}><Download className="size-4" />Export</Button>
          {!config.readOnly && <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button className="h-9 rounded-[10px] text-xs"><Plus className="size-4" />{config.primaryAction}</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>{config.primaryAction}</DialogTitle><DialogDescription>Create a local mock record for UI testing. Backend persistence can be connected later.</DialogDescription></DialogHeader><div className="space-y-2"><Label htmlFor="workspace-name">Name or reference</Label><Input id="workspace-name" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder={`Enter ${config.columns[0].label.toLowerCase()}`} /></div><DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={addRow} disabled={!newName.trim()}>Save</Button></DialogFooter></DialogContent>
          </Dialog>}
        </div>
      </div>

      {config.metrics && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{config.metrics.map((metric) => <Card key={metric.label} className="rounded-2xl shadow-none"><CardContent className="p-4"><p className="text-[11px] font-medium text-muted-foreground">{metric.label}</p><div className="mt-1 flex items-end justify-between gap-2"><p className="font-heading text-2xl font-bold tracking-tight">{metric.value}</p>{metric.change && <span className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold text-success">{metric.change}</span>}</div></CardContent></Card>)}</div>}

      <Card className="overflow-hidden rounded-2xl shadow-none">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={config.searchPlaceholder} className="h-9 rounded-[10px] bg-muted pl-9 text-xs" /></div>
          {statuses.length > 0 && <Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-full rounded-[10px] text-xs sm:w-44"><Filter className="size-3.5" /><SelectValue placeholder="All statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{statuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>}
          <span className="text-[11px] font-medium text-muted-foreground">{visibleRows.length} records{config.sourceLabel ? ` · ${config.sourceLabel}` : ""}</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow className="bg-muted/60 hover:bg-muted/60">{config.columns.map((column) => <TableHead key={column.key} className={cn("h-10 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider", column.align === "right" && "text-right", column.align === "center" && "text-center")}>{column.label}</TableHead>)}</TableRow></TableHeader>
            <TableBody>
              {visibleRows.map((row) => <TableRow key={row.id} className="h-14">{config.columns.map((column, index) => { const value = String(row[column.key] ?? "—"); return <TableCell key={column.key} className={cn("whitespace-nowrap text-xs", column.align === "right" && "text-right", column.align === "center" && "text-center", column.format === "mono" && "font-mono text-[11px]")}>{column.format === "status" ? <StatusBadge variant={statusVariant(value)}>{value}</StatusBadge> : index === 0 && config.linkPrefix ? <Link href={`${config.linkPrefix}/${row.id}`} className="font-bold text-primary hover:underline">{value}</Link> : <span className={index === 0 ? "font-semibold" : undefined}>{value}</span>}</TableCell>; })}</TableRow>)}
              {visibleRows.length === 0 && <TableRow><TableCell colSpan={config.columns.length} className="h-32 text-center text-sm text-muted-foreground">No records match your filters.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
