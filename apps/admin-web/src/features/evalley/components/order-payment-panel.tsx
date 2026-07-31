"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, CreditCard } from "lucide-react";
import { toast } from "sonner";
import type { Order, Refund } from "@platform/ecommerce-core";
import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/design-system/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/design-system/ui/card";
import { Input } from "@/design-system/ui/input";
import { Label } from "@/design-system/ui/label";
import { Separator } from "@/design-system/ui/separator";
import { cn } from "@/core/utils/cn";
import { orderCurrency as currency, isPaid, paymentStatusVariant } from "../order-status";
import { markOrderPaidAction } from "../api/order.mutations";
import { createRefundAction } from "../api/refund.mutations";

type Txn = {
  id: string;
  label: string;
  sublabel?: string;
  amount: number;
  at: string | null;
  kind: "credit" | "debit";
};

export function OrderPaymentPanel({
  order,
  refunds,
  canManage,
}: {
  order: Order;
  refunds: readonly Refund[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const paid = isPaid(order.payment?.status);
  const refunded = refunds.reduce((sum, r) => sum + r.amount, 0);
  const remaining = Math.max(order.total - refunded, 0);
  const netCaptured = paid ? Math.max(order.total - refunded, 0) : 0;

  const txns: Txn[] = [
    {
      id: "charge",
      label: paid ? "Payment captured" : "Awaiting payment",
      sublabel: order.payment?.method ?? undefined,
      amount: order.total,
      at: order.payment?.paidAt ?? null,
      kind: "credit",
    },
    ...refunds.map<Txn>((r) => ({
      id: r.id,
      label: "Refund",
      sublabel: r.reason ?? undefined,
      amount: -r.amount,
      at: r.processedAt,
      kind: "debit",
    })),
  ];

  function recordPayment() {
    startTransition(async () => {
      const res = await markOrderPaidAction(order.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Payment recorded");
      router.refresh();
    });
  }

  function issueRefund() {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter a refund amount greater than zero.");
      return;
    }
    if (value > remaining) {
      toast.error(`Refund cannot exceed the remaining ${currency.format(remaining)}.`);
      return;
    }
    startTransition(async () => {
      const res = await createRefundAction(order.id, value, reason);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Refund issued");
      setAmount("");
      setReason("");
      router.refresh();
    });
  }

  return (
    <Card className="rounded-2xl shadow-none">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="font-heading text-base">Payment &amp; transactions</CardTitle>
        <StatusBadge variant={paymentStatusVariant(order.payment?.status)}>
          {order.payment?.status ?? "unpaid"}
        </StatusBadge>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Method</p>
            <p className="font-medium capitalize">{order.payment?.method ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Net captured</p>
            <p className="font-medium">{currency.format(netCaptured)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Order total</p>
            <p className="font-medium">{currency.format(order.total)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Refunded</p>
            <p className="font-medium">{currency.format(refunded)}</p>
          </div>
        </div>

        {canManage && !paid ? (
          <Button className="w-full" disabled={pending} onClick={recordPayment}>
            <CreditCard className="size-4" />
            {pending ? "Recording..." : "Record payment"}
          </Button>
        ) : null}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Transactions
          </p>
          <ul className="space-y-2">
            {txns.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full",
                      t.kind === "credit"
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning-foreground dark:text-warning",
                    )}
                  >
                    {t.kind === "credit" ? (
                      <ArrowDownLeft className="size-4" />
                    ) : (
                      <ArrowUpRight className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{t.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.sublabel ? `${t.sublabel} · ` : ""}
                      {t.at ? new Date(t.at).toLocaleString("en-US") : "Pending"}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 font-semibold tabular-nums",
                    t.amount < 0 ? "text-muted-foreground" : "",
                  )}
                >
                  {t.amount < 0 ? "-" : ""}
                  {currency.format(Math.abs(t.amount))}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {canManage && remaining > 0 ? (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Issue refund
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="refund-amount">Amount</Label>
                <Input
                  id="refund-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  max={remaining}
                  placeholder={`Up to ${currency.format(remaining)}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="refund-reason">Reason (optional)</Label>
                <Input
                  id="refund-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. damaged item"
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                disabled={pending}
                onClick={issueRefund}
              >
                {pending ? "Processing..." : "Issue refund"}
              </Button>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
