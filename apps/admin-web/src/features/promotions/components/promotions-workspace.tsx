"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BadgePercent,
  Filter,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type {
  Promotion,
  PromotionDiscountType,
  PromotionType,
  SavePromotionInput,
} from "@platform/ecommerce-core";
import { PageContainer } from "@/components/page/page-container";
import { StatusBadge } from "@/components/status/status-badge";
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
  DialogTrigger,
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
  discountLabel,
  promoName,
  promoStatusVariant,
  scheduleLabel,
  type PromotionsView,
} from "../promotion-status";
import {
  createPromotionAction,
  deletePromotionAction,
  pausePromotionAction,
  publishPromotionAction,
} from "../api/promotion.mutations";

const STATUSES = ["draft", "scheduled", "active", "paused", "expired"] as const;

function CreatePromotionForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [type, setType] = useState<PromotionType>("automatic");
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<PromotionDiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [status, setStatus] = useState<"draft" | "scheduled">("draft");

  function submit() {
    if (!name.trim()) {
      toast.error("Enter a promotion name.");
      return;
    }
    if (type === "coupon" && !code.trim()) {
      toast.error("Coupon promotions need a code.");
      return;
    }
    if (discountType !== "free_shipping" && !discountValue) {
      toast.error("Enter a discount value.");
      return;
    }
    const input: SavePromotionInput = {
      type,
      discountType,
      discountValue: discountType === "free_shipping" ? undefined : Number(discountValue),
      maxDiscountAmount: maxDiscount ? Number(maxDiscount) : undefined,
      code: type === "coupon" ? code.trim() : undefined,
      startsAt: startsAt || undefined,
      endsAt: endsAt || undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      status,
      translations: { en: { name: name.trim() } },
    };
    startTransition(async () => {
      const res = await createPromotionAction(input);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Promotion created");
      router.refresh();
      onDone();
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="promo-name">Name</Label>
        <Input id="promo-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer Sale" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="promo-type">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as PromotionType)}>
            <SelectTrigger id="promo-type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="automatic">Automatic</SelectItem>
              <SelectItem value="coupon">Coupon code</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {type === "coupon" ? (
          <div className="space-y-1.5">
            <Label htmlFor="promo-code">Coupon code</Label>
            <Input id="promo-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SUMMER15" />
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="promo-status">Initial status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "scheduled")}>
              <SelectTrigger id="promo-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="promo-dtype">Discount type</Label>
          <Select value={discountType} onValueChange={(v) => setDiscountType(v as PromotionDiscountType)}>
            <SelectTrigger id="promo-dtype"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed_amount">Fixed amount</SelectItem>
              <SelectItem value="free_shipping">Free shipping</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {discountType !== "free_shipping" ? (
          <div className="space-y-1.5">
            <Label htmlFor="promo-value">
              {discountType === "percentage" ? "Percent (0–100)" : "Amount"}
            </Label>
            <Input id="promo-value" type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="promo-start">Starts</Label>
          <Input id="promo-start" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="promo-end">Ends</Label>
          <Input id="promo-end" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="promo-max">Max discount (optional)</Label>
          <Input id="promo-max" type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="promo-usage">Usage limit (optional)</Label>
          <Input id="promo-usage" type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onDone} disabled={pending}>Cancel</Button>
        <Button onClick={submit} disabled={pending}>{pending ? "Creating..." : "Create promotion"}</Button>
      </DialogFooter>
    </div>
  );
}

export function PromotionsWorkspace({
  view,
  canManage,
}: {
  view: PromotionsView;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);

  const { promotions, total } = view;

  const rows = useMemo(
    () =>
      promotions.filter((p) => {
        const matches =
          !query ||
          [promoName(p), p.code ?? "", p.slug ?? ""].some((v) =>
            v.toLowerCase().includes(query.toLowerCase()),
          );
        return matches && (status === "all" || p.status === status);
      }),
    [promotions, query, status],
  );

  const metrics = useMemo(
    () => [
      { label: "Total", value: String(total) },
      { label: "Active", value: String(promotions.filter((p) => p.status === "active").length) },
      { label: "Coupons", value: String(promotions.filter((p) => p.type === "coupon").length) },
      { label: "Scheduled", value: String(promotions.filter((p) => p.status === "scheduled").length) },
    ],
    [promotions, total],
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

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight">Promotions &amp; discounts</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Automatic discounts and coupon codes from the commerce API.
          </p>
        </div>
        {canManage ? (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-9 rounded-[10px] text-xs">
                <Plus className="size-4" />
                New promotion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>New promotion</DialogTitle>
                <DialogDescription>
                  Create a draft or scheduled promotion. Publishing it live is a separate action.
                </DialogDescription>
              </DialogHeader>
              <CreatePromotionForm onDone={() => setCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
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
              placeholder="Search name or code..."
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
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-[11px] font-medium text-muted-foreground">{rows.length} promotions</span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Promotion</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Type</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Code</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Discount</TableHead>
                <TableHead className="h-10 text-right text-[10px] font-bold uppercase tracking-wider">Usage</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Schedule</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                {canManage ? <TableHead className="h-10 w-10" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id} className="h-14">
                  <TableCell className="max-w-56">
                    <p className="truncate text-sm font-medium">{promoName(p)}</p>
                    {p.slug ? <p className="truncate font-mono text-[11px] text-muted-foreground">{p.slug}</p> : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{p.type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[11px]">{p.code ?? "—"}</TableCell>
                  <TableCell className="text-xs">{discountLabel(p)}</TableCell>
                  <TableCell className="text-right text-xs tabular-nums">
                    {p.usedCount}
                    {p.usageLimit ? ` / ${p.usageLimit}` : ""}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{scheduleLabel(p)}</TableCell>
                  <TableCell>
                    <StatusBadge variant={promoStatusVariant(p.status)}>{p.status}</StatusBadge>
                  </TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${promoName(p)}`} disabled={pending}>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>{promoName(p)}</DropdownMenuLabel>
                          <DropdownMenuItem
                            disabled={p.status === "active" || p.status === "expired"}
                            onSelect={() => run(() => publishPromotionAction(p.id), "Promotion published")}
                          >
                            <Play className="size-4" />
                            Publish
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={p.status !== "active"}
                            onSelect={() => run(() => pausePromotionAction(p.id), "Promotion paused")}
                          >
                            <Pause className="size-4" />
                            Pause
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => setDeleteTarget(p)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 8 : 7} className="h-32 text-center text-sm text-muted-foreground">
                    <BadgePercent className="mx-auto mb-2 size-6 opacity-40" />
                    No promotions match your filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget ? promoName(deleteTarget) : "promotion"}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the promotion. Redemption history is retained. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const target = deleteTarget;
                setDeleteTarget(null);
                if (target) run(() => deletePromotionAction(target.id), "Promotion deleted");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
