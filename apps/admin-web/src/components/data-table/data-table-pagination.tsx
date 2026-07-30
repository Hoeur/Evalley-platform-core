"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/design-system/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/design-system/ui/select";

function visiblePages(page: number, pageCount: number) {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, index) => index + 1);
  return Array.from(new Set([1, Math.max(1, page - 1), page, Math.min(pageCount, page + 1), pageCount])).sort((a, b) => a - b);
}

export function DataTablePagination({ page, pageCount, limit, total, entityName, selectedCount }: { page: number; pageCount: number; limit: number; total: number; entityName: string; selectedCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const current = useSearchParams();
  const update = (values: Record<string, string>) => { const params = new URLSearchParams(current); Object.entries(values).forEach(([key, value]) => params.set(key, value)); router.push(`${pathname}?${params.toString()}`); };
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return <div className="flex flex-col gap-3 border-t bg-muted/15 px-4 py-3 lg:flex-row lg:items-center lg:justify-between"><p className="text-xs text-muted-foreground">{selectedCount ? `${selectedCount} selected · ` : ""}Showing <span className="font-medium text-foreground">{start}–{end}</span> of <span className="font-medium text-foreground">{total}</span> {entityName}{total === 1 ? "" : "s"}</p><div className="flex flex-wrap items-center gap-2"><span className="hidden text-xs text-muted-foreground sm:inline">Rows per page</span><Select value={String(limit)} onValueChange={(value) => update({ limit: value, page: "1" })}><SelectTrigger className="w-20 bg-background"><SelectValue /></SelectTrigger><SelectContent>{[10, 25, 50].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent></Select><div className="ml-auto flex items-center gap-1 lg:ml-2"><Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })} aria-label="Previous page"><ChevronLeft /></Button>{visiblePages(page, pageCount).map((pageNumber, index, pages) => <span className="contents" key={pageNumber}>{index > 0 && pageNumber - pages[index - 1] > 1 && <span className="px-1 text-xs text-muted-foreground">…</span>}<Button variant={pageNumber === page ? "default" : "outline"} size="icon-sm" onClick={() => update({ page: String(pageNumber) })} aria-label={`Page ${pageNumber}`} aria-current={pageNumber === page ? "page" : undefined}>{pageNumber}</Button></span>)}<Button variant="outline" size="icon-sm" disabled={page >= pageCount} onClick={() => update({ page: String(page + 1) })} aria-label="Next page"><ChevronRight /></Button></div></div></div>;
}
