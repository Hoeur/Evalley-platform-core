"use client";

import type {
  InventoryItem,
  InventoryMetrics,
  StockMovement,
} from "@platform/ecommerce-core";
import { Boxes, History, Search, Settings2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/page/page-container";
import { Badge } from "@/design-system/ui/badge";
import { Button } from "@/design-system/ui/button";
import { Card, CardContent } from "@/design-system/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/design-system/ui/dialog";
import { Input } from "@/design-system/ui/input";
import { Label } from "@/design-system/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/ui/select";
import { Switch } from "@/design-system/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/design-system/ui/table";
import { Textarea } from "@/design-system/ui/textarea";
import {
  applyStockMovementAction,
  getStockMovementsAction,
  updateInventorySettingsAction,
} from "./mutations";
import type { InventorySettingsValues, StockMovementValues } from "./schemas";

function InventoryStatus({ status }: { status: InventoryItem["status"] }) {
  const variant =
    status === "in_stock"
      ? "default"
      : status === "out_of_stock"
        ? "destructive"
        : "secondary";

  return (
    <Badge variant={variant} className="capitalize">
      {status.replaceAll("_", " ")}
    </Badge>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="rounded-2xl shadow-none">
      <CardContent className="p-4">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="font-heading mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function InventoryManagementWorkspace({
  items,
  metrics,
  canManage,
}: {
  items: readonly InventoryItem[];
  metrics: InventoryMetrics;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [settingsForm, setSettingsForm] = useState<InventorySettingsValues>();
  const [movementDialog, setMovementDialog] = useState(false);
  const [movementForm, setMovementForm] = useState<StockMovementValues>();
  const [historyDialog, setHistoryDialog] = useState(false);
  const [history, setHistory] = useState<readonly StockMovement[]>([]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        `${item.productName ?? ""} ${item.sku ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [items, query],
  );

  function openSettings(item: InventoryItem) {
    setSettingsForm({
      productId: item.productId,
      manageStock: item.manageStock,
      allowBackorder: item.allowBackorder,
      lowStockThreshold: item.lowStockThreshold,
      expectedVersion: item.version,
    });
    setSettingsDialog(true);
  }

  function saveSettings() {
    if (!settingsForm) return;
    startTransition(async () => {
      const result = await updateInventorySettingsAction(settingsForm);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Stock settings updated");
      setSettingsDialog(false);
      router.refresh();
    });
  }

  function openMovement(item: InventoryItem) {
    setMovementForm({
      productId: item.productId,
      delta: 1,
      reason: "stock_in",
      note: "",
      referenceKey: "",
    });
    setMovementDialog(true);
  }

  function openHistory(item: InventoryItem) {
    startTransition(async () => {
      const result = await getStockMovementsAction(item.productId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setHistory(result.items);
      setHistoryDialog(true);
    });
  }

  function applyMovement() {
    if (!movementForm) return;
    startTransition(async () => {
      const result = await applyStockMovementAction(movementForm);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Stock quantity adjusted");
      setMovementDialog(false);
      router.refresh();
    });
  }

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight">
            Inventory & stock
          </h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Configure product stock using the existing inventory settings and
            movement API fields.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/inventory/reports">View reports</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="On hand" value={metrics.totalOnHand} />
        <MetricCard label="Available" value={metrics.totalAvailable} />
        <MetricCard label="Low stock products" value={metrics.lowStockCount} />
        <MetricCard
          label="Out of stock products"
          value={metrics.outOfStockCount}
        />
      </div>

      <div className="relative max-w-xl">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search product name or SKU"
          className="pl-9"
        />
      </div>

      <Card className="overflow-hidden rounded-2xl shadow-none">
        <div className="border-b p-4">
          <p className="font-semibold">Product stock</p>
          <p className="text-muted-foreground text-xs">
            Store-wide inventory used by checkout, reservations, and orders.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">On hand</TableHead>
              <TableHead className="text-right">Reserved</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.productId}>
                <TableCell className="font-medium">
                  {item.productName ?? `Product #${item.productId}`}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {item.sku ?? "—"}
                </TableCell>
                <TableCell className="text-right">{item.onHand}</TableCell>
                <TableCell className="text-right">{item.reserved}</TableCell>
                <TableCell className="text-right">{item.available}</TableCell>
                <TableCell>
                  <InventoryStatus status={item.status} />
                </TableCell>
                <TableCell className="text-right">
                  {canManage && (
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`History for ${item.productName ?? item.productId}`}
                        onClick={() => openHistory(item)}
                      >
                        <History />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openMovement(item)}
                      >
                        <Boxes /> Adjust
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Configure ${item.productName ?? item.productId}`}
                        onClick={() => openSettings(item)}
                      >
                        <Settings2 />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredItems.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground h-28 text-center"
                >
                  No inventory records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <SettingsDialog
        open={settingsDialog}
        onOpenChange={setSettingsDialog}
        form={settingsForm}
        setForm={setSettingsForm}
        pending={pending}
        onSave={saveSettings}
      />
      <MovementDialog
        open={movementDialog}
        onOpenChange={setMovementDialog}
        form={movementForm}
        setForm={setMovementForm}
        pending={pending}
        onSave={applyMovement}
      />
      <Dialog open={historyDialog} onOpenChange={setHistoryDialog}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Stock movement history</DialogTitle>
            <DialogDescription>
              Existing movement API records with reason, delta, reference, note,
              and time.
            </DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Delta</TableHead>
                <TableHead className="text-right">Before</TableHead>
                <TableHead className="text-right">After</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Actor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    {new Date(movement.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{movement.reason}</TableCell>
                  <TableCell className="text-right">
                    {movement.quantityDelta}
                  </TableCell>
                  <TableCell className="text-right">
                    {movement.quantityBefore}
                  </TableCell>
                  <TableCell className="text-right">
                    {movement.quantityAfter}
                  </TableCell>
                  <TableCell>{movement.referenceKey ?? "—"}</TableCell>
                  <TableCell>{movement.note ?? "—"}</TableCell>
                  <TableCell>{movement.createdBy ?? "System"}</TableCell>
                </TableRow>
              ))}
              {history.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-muted-foreground h-24 text-center"
                  >
                    No stock movements found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function SettingsDialog({
  open,
  onOpenChange,
  form,
  setForm,
  pending,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form?: InventorySettingsValues;
  setForm: React.Dispatch<
    React.SetStateAction<InventorySettingsValues | undefined>
  >;
  pending: boolean;
  onSave: () => void;
}) {
  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stock settings</DialogTitle>
          <DialogDescription>
            Maps directly to manage_stock, allow_backorder, low_stock_threshold,
            and expected_version.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <ToggleField
            label="Manage stock"
            description="Track product quantity through inventory movements."
            checked={form.manageStock}
            onCheckedChange={(manageStock) =>
              setForm((value) => value && { ...value, manageStock })
            }
          />
          <ToggleField
            label="Allow backorders"
            description="Permit sales when available quantity reaches zero."
            checked={form.allowBackorder}
            onCheckedChange={(allowBackorder) =>
              setForm((value) => value && { ...value, allowBackorder })
            }
          />
          <Field label="Low-stock threshold">
            <Input
              type="number"
              min={0}
              value={form.lowStockThreshold ?? ""}
              onChange={(event) =>
                setForm(
                  (value) =>
                    value && {
                      ...value,
                      lowStockThreshold:
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                    },
                )
              }
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={pending} onClick={onSave}>
            {pending ? "Saving..." : "Save settings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MovementDialog({
  open,
  onOpenChange,
  form,
  setForm,
  pending,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form?: StockMovementValues;
  setForm: React.Dispatch<
    React.SetStateAction<StockMovementValues | undefined>
  >;
  pending: boolean;
  onSave: () => void;
}) {
  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>
            Positive delta adds stock; negative delta removes stock. The API
            records every movement.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Quantity change (delta)">
            <Input
              type="number"
              value={form.delta}
              onChange={(event) =>
                setForm(
                  (value) =>
                    value && { ...value, delta: Number(event.target.value) },
                )
              }
            />
          </Field>
          <Field label="Reason">
            <Select
              value={form.reason}
              onValueChange={(reason: StockMovementValues["reason"]) =>
                setForm((value) => value && { ...value, reason })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stock_in">stock_in</SelectItem>
                <SelectItem value="stock_out">stock_out</SelectItem>
                <SelectItem value="manual_adjustment">
                  manual_adjustment
                </SelectItem>
                <SelectItem value="inventory_count">inventory_count</SelectItem>
                <SelectItem value="return">return</SelectItem>
                <SelectItem value="damage">damage</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Note">
            <Textarea
              value={form.note}
              onChange={(event) =>
                setForm(
                  (value) => value && { ...value, note: event.target.value },
                )
              }
            />
          </Field>
          <Field label="Reference key">
            <Input
              value={form.referenceKey}
              onChange={(event) =>
                setForm(
                  (value) =>
                    value && {
                      ...value,
                      referenceKey: event.target.value,
                    },
                )
              }
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={pending || form.delta === 0} onClick={onSave}>
            {pending ? "Applying..." : "Apply adjustment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <Label>{label}</Label>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
