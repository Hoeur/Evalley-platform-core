"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Refund } from "@platform/ecommerce-core";
import { Button } from "@/design-system/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/design-system/ui/card";
import { Input } from "@/design-system/ui/input";
import { Label } from "@/design-system/ui/label";
import { createRefundAction } from "../api/refund.mutations";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function OrderRefundsPanel({
  orderId,
  refunds,
  maxAmount,
  canManage,
}: {
  orderId: string;
  refunds: readonly Refund[];
  maxAmount: number;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const refunded = refunds.reduce((sum, refund) => sum + refund.amount, 0);
  const remaining = Math.max(maxAmount - refunded, 0);

  function submit() {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter a refund amount greater than zero.");
      return;
    }
    if (value > remaining) {
      toast.error(
        `Refund cannot exceed the remaining ${currency.format(remaining)}.`,
      );
      return;
    }
    startTransition(async () => {
      const result = await createRefundAction(orderId, value, reason);
      if (!result.ok) {
        toast.error(result.error);
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
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-heading text-base">Refunds</CardTitle>
        <span className="text-muted-foreground text-xs">
          {currency.format(refunded)} refunded
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {refunds.length === 0 ? (
          <p className="text-muted-foreground text-sm">No refunds issued.</p>
        ) : (
          <ul className="space-y-2">
            {refunds.map((refund) => (
              <li
                key={refund.id}
                className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-semibold">
                    {currency.format(refund.amount)}
                  </p>
                  {refund.reason && (
                    <p className="text-muted-foreground truncate text-xs">
                      {refund.reason}
                    </p>
                  )}
                </div>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {refund.processedAt
                    ? new Date(refund.processedAt).toLocaleDateString("en-US")
                    : "Pending"}
                </span>
              </li>
            ))}
          </ul>
        )}

        {canManage && remaining > 0 && (
          <div className="space-y-2 border-t pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="refund-amount">Refund amount</Label>
              <Input
                id="refund-amount"
                type="number"
                min={0}
                step="0.01"
                max={remaining}
                placeholder={`Up to ${currency.format(remaining)}`}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="refund-reason">Reason (optional)</Label>
              <Input
                id="refund-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="e.g. damaged item"
              />
            </div>
            <Button className="w-full" disabled={pending} onClick={submit}>
              {pending ? "Issuing..." : "Issue refund"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
