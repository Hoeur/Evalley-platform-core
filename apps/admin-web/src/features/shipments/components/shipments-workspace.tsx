"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Filter, MoreHorizontal, Search, Truck } from "lucide-react";
import { toast } from "sonner";
import type { Shipment, ShipmentStatus } from "@platform/ecommerce-core";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/design-system/ui/dropdown-menu";
import { updateShipmentStatusAction } from "../api/shipment.mutations";

const STATUSES: readonly ShipmentStatus[] = [
  "pending",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "failed",
  "returned",
  "cancelled",
];

function statusLabel(status: string): string {
  return status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusVariant(status: ShipmentStatus) {
  if (status === "delivered") return "success" as const;
  if (status === "failed" || status === "cancelled" || status === "returned")
    return "danger" as const;
  if (status === "in_transit" || status === "out_for_delivery")
    return "warning" as const;
  return "neutral" as const;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US");
}

export function ShipmentsWorkspace({
  shipments,
  total,
  canManage,
}: {
  shipments: readonly Shipment[];
  total: number;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");

  const metrics = useMemo(
    () => ({
      total,
      pending: shipments.filter((s) => s.status === "pending").length,
      transit: shipments.filter(
        (s) => s.status === "in_transit" || s.status === "out_for_delivery",
      ).length,
      delivered: shipments.filter((s) => s.status === "delivered").length,
    }),
    [shipments, total],
  );

  const visible = useMemo(
    () =>
      shipments.filter((shipment) => {
        const haystack =
          `${shipment.shipmentNumber} ${shipment.orderNumber ?? ""} ${shipment.trackingNumber ?? ""} ${shipment.carrierName ?? ""}`.toLowerCase();
        const matchesQuery = !query || haystack.includes(query.toLowerCase());
        return matchesQuery && (status === "all" || shipment.status === status);
      }),
    [shipments, query, status],
  );

  function changeStatus(id: string, next: ShipmentStatus) {
    startTransition(async () => {
      const result = await updateShipmentStatusAction(id, next);
      if (result.ok) {
        toast.success(`Shipment marked ${statusLabel(next)}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight">
            Shipments
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Every shipment across every order, live from the commerce API.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total shipments", value: metrics.total },
          { label: "Pending", value: metrics.pending },
          { label: "In transit", value: metrics.transit },
          { label: "Delivered", value: metrics.delivered },
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
              placeholder="Search shipment, order, tracking or carrier..."
              className="h-9 rounded-[10px] bg-muted pl-9 text-xs"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-full rounded-[10px] text-xs sm:w-48">
              <Filter className="size-3.5" />
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((item) => (
                <SelectItem key={item} value={item}>
                  {statusLabel(item)}
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
                  Shipment
                </TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">
                  Order
                </TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">
                  Carrier
                </TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">
                  Tracking
                </TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">
                  Created
                </TableHead>
                {canManage ? <TableHead className="h-10" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((shipment) => (
                <TableRow key={shipment.id} className="h-14">
                  <TableCell className="font-mono text-[11px] font-semibold">
                    {shipment.shipmentNumber}
                  </TableCell>
                  <TableCell className="font-mono text-[11px]">
                    {shipment.orderNumber ?? `#${shipment.orderId}`}
                  </TableCell>
                  <TableCell className="text-xs">
                    {shipment.carrierName ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-[11px]">
                    {shipment.trackingNumber ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={statusVariant(shipment.status)}>
                      {statusLabel(shipment.status)}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatDate(shipment.createdAt)}
                  </TableCell>
                  {canManage ? (
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
                          <DropdownMenuLabel>Set status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {STATUSES.filter(
                            (item) => item !== shipment.status,
                          ).map((item) => (
                            <DropdownMenuItem
                              key={item}
                              onClick={() => changeStatus(shipment.id, item)}
                            >
                              <Truck className="size-4" />
                              {statusLabel(item)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canManage ? 7 : 6}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No shipments match your filters.
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
