"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Filter, MoreHorizontal, Search } from "lucide-react";
import { toast } from "sonner";
import type { VendorStore } from "@platform/ecommerce-core";
import { PageContainer } from "@/components/page/page-container";
import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/design-system/ui/button";
import { Card, CardContent } from "@/design-system/ui/card";
import { Input } from "@/design-system/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/design-system/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/design-system/ui/dropdown-menu";
import { updateVendorStatusAction } from "../api/vendor.mutations";

const STATUSES = [
  "pending",
  "approved",
  "suspended",
  "rejected",
  "deactivated",
] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  suspended: "Suspended",
  rejected: "Rejected",
  deactivated: "Deactivated",
};

export function vendorStatusVariant(status: string) {
  if (status === "approved") return "success" as const;
  if (status === "pending") return "warning" as const;
  if (status === "suspended" || status === "rejected") return "danger" as const;
  return "neutral" as const;
}

export function commissionLabel(type: string, value: number): string {
  return type === "percentage"
    ? `${value}%`
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
}

export function VendorsWorkspace({
  vendors,
  total,
  canManage,
}: {
  vendors: readonly VendorStore[];
  total: number;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const metrics = useMemo(
    () => ({
      total,
      trading: vendors.filter((store) => store.isTrading).length,
      pending: vendors.filter((store) => store.status === "pending").length,
      suspended: vendors.filter((store) => store.status === "suspended").length,
    }),
    [vendors, total],
  );

  const visible = useMemo(
    () =>
      vendors.filter((store) => {
        const haystack =
          `${store.name} ${store.slug} ${store.contactEmail ?? ""}`.toLowerCase();
        const matchesQuery = !query || haystack.includes(query.toLowerCase());
        return matchesQuery && (status === "all" || store.status === status);
      }),
    [vendors, query, status],
  );

  function approve(id: string) {
    startTransition(async () => {
      const result = await updateVendorStatusAction(id, "approved");
      if (result.ok) {
        toast.success("Vendor approved");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <div>
        <h1 className="font-heading text-xl font-bold tracking-tight">Vendors</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Marketplace stores from the commerce API. Open a store to manage
          status, commission and balance.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total stores", value: metrics.total },
          { label: "Trading", value: metrics.trading },
          { label: "Pending", value: metrics.pending },
          { label: "Suspended", value: metrics.suspended },
        ].map((metric) => (
          <Card key={metric.label} className="rounded-2xl shadow-none">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium text-muted-foreground">
                {metric.label}
              </p>
              <p className="mt-1 font-heading text-2xl font-bold tracking-tight">
                {metric.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden rounded-2xl shadow-none">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search store, slug or contact..."
              className="h-9 rounded-[10px] bg-muted pl-9 text-xs"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-full rounded-[10px] text-xs sm:w-44">
              <Filter className="size-3.5" />
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((item) => (
                <SelectItem key={item} value={item}>
                  {STATUS_LABELS[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-[11px] font-medium text-muted-foreground">
            {visible.length} records · core-ecommerce-api
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">
                  Store
                </TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">
                  Slug
                </TableHead>
                <TableHead className="h-10 text-right text-[10px] font-bold uppercase tracking-wider">
                  Commission
                </TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">
                  Contact
                </TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="h-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((store) => (
                <TableRow key={store.id} className="h-14">
                  <TableCell>
                    <Link
                      href={`/vendors/${store.id}`}
                      className="font-bold text-primary hover:underline"
                    >
                      {store.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-[11px]">
                    {store.slug}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {commissionLabel(store.commissionType, store.commissionValue)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {store.contactEmail ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={vendorStatusVariant(store.status)}>
                      {STATUS_LABELS[store.status] ?? store.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          disabled={pending}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/vendors/${store.id}`}>
                            View details
                          </Link>
                        </DropdownMenuItem>
                        {canManage && store.status === "pending" ? (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => approve(store.id)}>
                              <CheckCircle2 className="size-4" />
                              Approve
                            </DropdownMenuItem>
                          </>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No vendors match your filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
