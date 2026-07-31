"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  CheckCircle2,
  Download,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/design-system/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/design-system/ui/alert-dialog";
import {
  ORDER_STATUSES,
  isCancellable,
  isPaid,
  orderStatusVariant,
  paymentStatusVariant,
  type OrderListItem,
  type OrdersView,
} from "../order-status";
import {
  cancelOrderAction,
  markOrderPaidAction,
  updateOrderStatusAction,
} from "../api/order.mutations";

export function OrdersWorkspace({
  view,
  canManage,
}: {
  view: OrdersView;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [cancelTarget, setCancelTarget] = useState<OrderListItem | null>(null);

  const { orders, metrics } = view;
  const statuses = useMemo(() => [...new Set(orders.map((o) => o.status))], [orders]);

  const rows = useMemo(
    () =>
      orders.filter((o) => {
        const matches =
          !query ||
          [o.number, o.customerId, o.status, o.paymentStatus, o.totalLabel].some((v) =>
            v.toLowerCase().includes(query.toLowerCase()),
          );
        return matches && (status === "all" || o.status === status);
      }),
    [orders, query, status],
  );

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) {
        toast.error(res.error ?? "Action failed");
        return;
      }
      toast.success(success);
      router.refresh();
    });
  }

  function exportCsv() {
    const header = ["Order", "Customer", "Date", "Items", "Payment", "Status", "Total"];
    const lines = rows.map((o) =>
      [
        o.number,
        o.customerId,
        new Date(o.createdAt).toLocaleDateString("en-US"),
        o.itemCount,
        o.paymentStatus,
        o.status,
        o.total,
      ]
        .map((v) => JSON.stringify(v))
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "orders.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("CSV export created");
  }

  const metricCards = [
    { label: "Total orders", value: String(metrics.totalOrders) },
    { label: "Processing", value: String(metrics.processing) },
    { label: "Completed", value: String(metrics.completed) },
    { label: "Page gross value", value: metrics.grossLabel },
  ];

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight">Orders</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {metrics.totalOrders} orders from the commerce API · manage status, payment and
            cancellations.
          </p>
        </div>
        <Button variant="outline" className="h-9 rounded-[10px] text-xs" onClick={exportCsv}>
          <Download className="size-4" />
          Export
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((m) => (
          <Card key={m.label} className="rounded-2xl shadow-none">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium text-muted-foreground">{m.label}</p>
              <p className="mt-1 font-heading text-2xl font-bold tracking-tight">{m.value}</p>
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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order or customer ID..."
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
              {statuses.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-[11px] font-medium text-muted-foreground">
            {rows.length} orders
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Order</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Customer</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Date</TableHead>
                <TableHead className="h-10 text-right text-[10px] font-bold uppercase tracking-wider">Items</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Payment</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                <TableHead className="h-10 text-right text-[10px] font-bold uppercase tracking-wider">Total</TableHead>
                {canManage ? <TableHead className="h-10 w-10" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((o) => (
                <TableRow key={o.id} className="h-14">
                  <TableCell className="whitespace-nowrap font-mono text-[11px]">
                    <button
                      type="button"
                      onClick={() => router.push(`/orders/${o.id}`)}
                      className="font-bold text-primary hover:underline"
                    >
                      {o.number}
                    </button>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">Customer #{o.customerId}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {new Date(o.createdAt).toLocaleDateString("en-US")}
                  </TableCell>
                  <TableCell className="text-right text-xs">{o.itemCount}</TableCell>
                  <TableCell className="text-xs">
                    <StatusBadge variant={paymentStatusVariant(o.paymentStatus)}>
                      {o.paymentStatus}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-xs">
                    <StatusBadge variant={orderStatusVariant(o.status)}>{o.status}</StatusBadge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right text-xs font-semibold">
                    {o.totalLabel}
                  </TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={`Actions for ${o.number}`}
                            disabled={pending}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Order {o.number}</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => router.push(`/orders/${o.id}`)}>
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <RefreshCw className="size-4" />
                              Change status
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {ORDER_STATUSES.map((s) => (
                                <DropdownMenuItem
                                  key={s}
                                  disabled={s === o.status}
                                  className="capitalize"
                                  onSelect={() =>
                                    run(
                                      () => updateOrderStatusAction(o.id, s),
                                      `Order ${o.number} → ${s}`,
                                    )
                                  }
                                >
                                  {s}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuItem
                            disabled={isPaid(o.paymentStatus)}
                            onSelect={() =>
                              run(
                                () => markOrderPaidAction(o.id),
                                `Order ${o.number} marked paid`,
                              )
                            }
                          >
                            <CheckCircle2 className="size-4" />
                            Mark as paid
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={!isCancellable(o.status)}
                            className="text-destructive focus:text-destructive"
                            onSelect={() => setCancelTarget(o)}
                          >
                            <Ban className="size-4" />
                            Cancel order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canManage ? 8 : 7}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No orders match your filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel order {cancelTarget?.number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This sets the order status to cancelled. Any captured payment must be refunded
              separately. This can’t be undone from here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep order</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const target = cancelTarget;
                setCancelTarget(null);
                if (target) {
                  run(() => cancelOrderAction(target.id), `Order ${target.number} cancelled`);
                }
              }}
            >
              Cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
