"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { CommissionType, StoreStatus } from "@platform/ecommerce-core";
import { PageContainer } from "@/components/page/page-container";
import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/design-system/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/design-system/ui/card";
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
import type { VendorDetail } from "../api/vendors.server";
import {
  adjustVendorBalanceAction,
  updateVendorCommissionAction,
  updateVendorStatusAction,
} from "../api/vendor.mutations";
import { commissionLabel, vendorStatusVariant } from "./vendors-workspace";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  suspended: "Suspended",
  rejected: "Rejected",
  deactivated: "Deactivated",
};

const LEDGER_LABELS: Record<string, string> = {
  accrued: "Accrued",
  reversal: "Reversal",
  partial_reversal: "Partial reversal",
  adjustment: "Adjustment",
  payout: "Payout",
};

type StatusAction = {
  label: string;
  status: StoreStatus;
  reason: boolean;
  variant?: "default" | "outline" | "destructive";
};

function actionsForStatus(status: string): StatusAction[] {
  switch (status) {
    case "pending":
      return [
        { label: "Approve", status: "approved", reason: false },
        { label: "Reject", status: "rejected", reason: true, variant: "destructive" },
      ];
    case "approved":
      return [
        { label: "Suspend", status: "suspended", reason: true, variant: "destructive" },
        { label: "Deactivate", status: "deactivated", reason: false, variant: "outline" },
      ];
    case "suspended":
      return [
        { label: "Reactivate", status: "approved", reason: false },
        { label: "Deactivate", status: "deactivated", reason: false, variant: "outline" },
      ];
    case "rejected":
      return [{ label: "Approve", status: "approved", reason: false }];
    case "deactivated":
      return [{ label: "Reactivate", status: "approved", reason: false }];
    default:
      return [];
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-2xl shadow-none">
      <CardContent className="p-4">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="mt-1 font-heading text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function VendorDetailWorkspace({
  detail,
  canManage,
}: {
  detail: VendorDetail;
  canManage: boolean;
}) {
  const router = useRouter();
  const { store, balance, summary, commissions } = detail;
  const [pending, startTransition] = useTransition();

  const [reasonFor, setReasonFor] = useState<StatusAction | null>(null);
  const [reason, setReason] = useState("");

  const [commissionOpen, setCommissionOpen] = useState(false);
  const [commissionType, setCommissionType] = useState<CommissionType>(
    store.commissionType,
  );
  const [commissionValue, setCommissionValue] = useState(
    String(store.commissionValue),
  );

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustNote, setAdjustNote] = useState("");

  function runStatus(status: StoreStatus, withReason?: string) {
    startTransition(async () => {
      const result = await updateVendorStatusAction(store.id, status, withReason);
      if (result.ok) {
        toast.success(`Vendor ${STATUS_LABELS[status] ?? status}`);
        setReasonFor(null);
        setReason("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function onAction(action: StatusAction) {
    if (action.reason) {
      setReason("");
      setReasonFor(action);
    } else {
      runStatus(action.status);
    }
  }

  function submitCommission() {
    const value = Number(commissionValue);
    if (!Number.isFinite(value) || value < 0) {
      toast.error("Enter a valid commission value.");
      return;
    }
    startTransition(async () => {
      const result = await updateVendorCommissionAction(
        store.id,
        commissionType,
        value,
      );
      if (result.ok) {
        toast.success("Commission updated");
        setCommissionOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function submitAdjustment() {
    const amount = Number(adjustAmount);
    if (!Number.isFinite(amount) || amount === 0) {
      toast.error("Enter a non-zero amount (negative claws money back).");
      return;
    }
    if (!adjustNote.trim()) {
      toast.error("A note is required for an adjustment.");
      return;
    }
    startTransition(async () => {
      const result = await adjustVendorBalanceAction(
        store.id,
        amount,
        adjustNote.trim(),
      );
      if (result.ok) {
        toast.success("Adjustment recorded");
        setAdjustOpen(false);
        setAdjustAmount("");
        setAdjustNote("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  const actions = actionsForStatus(store.status);

  return (
    <PageContainer className="max-w-[1200px] gap-4 py-5 md:px-7">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="icon" className="rounded-[10px]">
          <Link href="/vendors">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-heading text-xl font-bold">{store.name}</h1>
          <p className="text-xs text-muted-foreground">
            /{store.slug} · joined{" "}
            {new Date(store.createdAt).toLocaleDateString("en-US")}
          </p>
        </div>
        <StatusBadge variant={vendorStatusVariant(store.status)}>
          {STATUS_LABELS[store.status] ?? store.status}
        </StatusBadge>
      </div>

      {canManage && actions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant ?? "default"}
              className="h-9 rounded-[10px] text-xs"
              disabled={pending}
              onClick={() => onAction(action)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Available" value={money.format(balance.available)} />
        <Stat label="On hold" value={money.format(balance.onHold)} />
        <Stat label="Ledger balance" value={money.format(balance.ledgerBalance)} />
        <Stat label="Paid out" value={money.format(balance.paidOut)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="font-heading text-base">Store</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex justify-between gap-3">
              <span className="text-muted-foreground">Contact email</span>
              <span className="text-right">{store.contactEmail ?? "—"}</span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-muted-foreground">Contact phone</span>
              <span className="text-right">{store.contactPhone ?? "—"}</span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-muted-foreground">Address</span>
              <span className="text-right">
                {[store.addressLine, store.city, store.countryCode]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-muted-foreground">Trading</span>
              <span className="text-right">{store.isTrading ? "Yes" : "No"}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-none">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-heading text-base">Commission</CardTitle>
            {canManage ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-[10px] text-xs"
                onClick={() => setCommissionOpen(true)}
              >
                Edit
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex justify-between gap-3">
              <span className="text-muted-foreground">Rate</span>
              <span className="text-right font-semibold">
                {commissionLabel(store.commissionType, store.commissionValue)}
              </span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-muted-foreground">Type</span>
              <span className="text-right capitalize">
                {store.commissionType.replace("_", " ")}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-none">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-heading text-base">Balance</CardTitle>
            {canManage ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-[10px] text-xs"
                onClick={() => setAdjustOpen(true)}
              >
                Adjust
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex justify-between gap-3">
              <span className="text-muted-foreground">Gross sales</span>
              <span className="text-right">{money.format(balance.grossSales)}</span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-muted-foreground">Commission charged</span>
              <span className="text-right">
                {money.format(balance.commissionCharged)}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-none">
        <CardHeader>
          <CardTitle className="font-heading text-base">
            Commission summary
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {summary.from} → {summary.to}
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Stat label="Gross sales" value={money.format(summary.grossSales)} />
          <Stat
            label="Commission charged"
            value={money.format(summary.commissionCharged)}
          />
          <Stat label="Net movement" value={money.format(summary.netMovement)} />
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl shadow-none">
        <CardHeader>
          <CardTitle className="font-heading text-base">
            Commission ledger
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead>Type</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((entry) => (
                  <TableRow key={entry.id} className="h-12">
                    <TableCell className="text-xs">
                      {LEDGER_LABELS[entry.type] ?? entry.type}
                    </TableCell>
                    <TableCell className="font-mono text-[11px]">
                      {entry.orderNumber ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {money.format(entry.grossAmount)}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {money.format(entry.commissionAmount)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-semibold">
                      {money.format(entry.netAmount)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(entry.createdAt).toLocaleDateString("en-US")}
                    </TableCell>
                  </TableRow>
                ))}
                {commissions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      No commission entries in this window.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={reasonFor !== null}
        onOpenChange={(open) => {
          if (!open) setReasonFor(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reasonFor?.label} vendor</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="status-reason">Reason (shown to the vendor)</Label>
            <Textarea
              id="status-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain why..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReasonFor(null)}>
              Cancel
            </Button>
            <Button
              disabled={pending || !reason.trim()}
              onClick={() => {
                if (reasonFor) runStatus(reasonFor.status, reason.trim());
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={commissionOpen} onOpenChange={setCommissionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit commission</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={commissionType}
                onValueChange={(value) =>
                  setCommissionType(value as CommissionType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed_amount">Fixed amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commission-value">
                Value {commissionType === "percentage" ? "(%)" : "(amount)"}
              </Label>
              <Input
                id="commission-value"
                type="number"
                value={commissionValue}
                onChange={(event) => setCommissionValue(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommissionOpen(false)}>
              Cancel
            </Button>
            <Button disabled={pending} onClick={submitCommission}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual balance adjustment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="adjust-amount">Amount</Label>
              <Input
                id="adjust-amount"
                type="number"
                value={adjustAmount}
                onChange={(event) => setAdjustAmount(event.target.value)}
                placeholder="-25.00 (negative claws money back)"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adjust-note">Note (required)</Label>
              <Textarea
                id="adjust-note"
                value={adjustNote}
                onChange={(event) => setAdjustNote(event.target.value)}
                placeholder="Why this adjustment..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustOpen(false)}>
              Cancel
            </Button>
            <Button disabled={pending} onClick={submitAdjustment}>
              Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
