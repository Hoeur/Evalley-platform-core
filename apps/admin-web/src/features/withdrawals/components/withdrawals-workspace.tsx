"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Filter, MoreHorizontal, Search, Wallet, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { Withdrawal } from "@platform/ecommerce-core";
import { PageContainer } from "@/components/page/page-container";
import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/design-system/ui/button";
import { Card, CardContent } from "@/design-system/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/design-system/ui/dialog";
import { Input } from "@/design-system/ui/input";
import { Label } from "@/design-system/ui/label";
import { Textarea } from "@/design-system/ui/textarea";
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
import { processWithdrawalAction } from "../api/withdrawal.mutations";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const STATUSES = ["pending", "approved", "rejected", "paid", "cancelled"] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  paid: "Paid",
  cancelled: "Cancelled",
};

function statusVariant(status: string) {
  if (status === "paid") return "success" as const;
  if (status === "approved" || status === "pending") return "warning" as const;
  if (status === "rejected") return "danger" as const;
  return "neutral" as const;
}

export function WithdrawalsWorkspace({
  withdrawals,
  total,
  canManage,
}: {
  withdrawals: readonly Withdrawal[];
  total: number;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const metrics = useMemo(() => {
    const pendingItems = withdrawals.filter((w) => w.status === "pending");
    return {
      total,
      pending: pendingItems.length,
      pendingValue: pendingItems.reduce((sum, w) => sum + w.amount, 0),
      paid: withdrawals.filter((w) => w.status === "paid").length,
    };
  }, [withdrawals, total]);

  const visible = useMemo(
    () =>
      withdrawals.filter((withdrawal) => {
        const haystack =
          `${withdrawal.reference} ${withdrawal.storeName ?? ""} ${withdrawal.bankName ?? ""}`.toLowerCase();
        const matchesQuery = !query || haystack.includes(query.toLowerCase());
        return (
          matchesQuery && (status === "all" || withdrawal.status === status)
        );
      }),
    [withdrawals, query, status],
  );

  function process(id: string, next: "approved" | "paid") {
    startTransition(async () => {
      const result = await processWithdrawalAction(id, next);
      if (result.ok) {
        toast.success(`Withdrawal ${STATUS_LABELS[next]}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function confirmReject() {
    if (!rejectId) return;
    startTransition(async () => {
      const result = await processWithdrawalAction(
        rejectId,
        "rejected",
        reason.trim(),
      );
      if (result.ok) {
        toast.success("Withdrawal rejected");
        setRejectId(null);
        setReason("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <div>
        <h1 className="font-heading text-xl font-bold tracking-tight">
          Withdrawals
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Vendor payout requests from the commerce API.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total requests", value: String(metrics.total) },
          { label: "Pending", value: String(metrics.pending) },
          { label: "Pending value", value: money.format(metrics.pendingValue) },
          { label: "Paid", value: String(metrics.paid) },
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
              placeholder="Search reference, store or bank..."
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
                <TableHead>Reference</TableHead>
                <TableHead>Store</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                {canManage ? <TableHead /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((withdrawal) => {
                const actionable =
                  withdrawal.status === "pending" ||
                  withdrawal.status === "approved";
                return (
                  <TableRow key={withdrawal.id} className="h-14">
                    <TableCell className="font-mono text-[11px] font-semibold">
                      {withdrawal.reference}
                    </TableCell>
                    <TableCell className="text-xs">
                      {withdrawal.storeName ?? `Store #${withdrawal.storeId}`}
                    </TableCell>
                    <TableCell className="text-right text-xs font-semibold">
                      {money.format(withdrawal.amount)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {withdrawal.bankName ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge variant={statusVariant(withdrawal.status)}>
                        {STATUS_LABELS[withdrawal.status] ?? withdrawal.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {withdrawal.requestedAt
                        ? new Date(withdrawal.requestedAt).toLocaleDateString(
                            "en-US",
                          )
                        : "—"}
                    </TableCell>
                    {canManage ? (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              disabled={pending || !actionable}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {withdrawal.status === "pending" ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  process(withdrawal.id, "approved")
                                }
                              >
                                <BadgeCheck className="size-4" />
                                Approve
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem
                              onClick={() => process(withdrawal.id, "paid")}
                            >
                              <Wallet className="size-4" />
                              Mark paid
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setReason("");
                                setRejectId(withdrawal.id);
                              }}
                            >
                              <XCircle className="size-4" />
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })}
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canManage ? 7 : 6}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No withdrawals match your filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog
        open={rejectId !== null}
        onOpenChange={(open) => {
          if (!open) setRejectId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject withdrawal</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason (shown to the vendor)</Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Bank details could not be verified..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>
              Cancel
            </Button>
            <Button
              disabled={pending || !reason.trim()}
              onClick={confirmReject}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
