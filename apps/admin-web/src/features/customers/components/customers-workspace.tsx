"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Filter, KeyRound, MoreHorizontal, Search } from "lucide-react";
import { toast } from "sonner";
import type { Customer } from "@platform/ecommerce-core";
import { PageContainer } from "@/components/page/page-container";
import { StatusBadge } from "@/components/status/status-badge";
import { Avatar, AvatarFallback } from "@/design-system/ui/avatar";
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
  DropdownMenuTrigger,
} from "@/design-system/ui/dropdown-menu";
import { customerInitials, isEmailVerified, type CustomersView } from "../customer-utils";
import { resetCustomerPasswordAction } from "../api/customer.mutations";

function ResetPasswordDialog({
  customer,
  onClose,
}: {
  customer: Customer | null;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  function submit() {
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!customer) return;
    startTransition(async () => {
      const res = await resetCustomerPasswordAction(customer.id, password);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Password reset for ${customer.name}`);
      setPassword("");
      setConfirm("");
      onClose();
    });
  }

  return (
    <Dialog open={customer !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Set a new password for {customer?.name}. They can change it after signing in.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input id="confirm-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button onClick={submit} disabled={pending}>{pending ? "Saving..." : "Reset password"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CustomersWorkspace({
  view,
  canManage,
}: {
  view: CustomersView;
  canManage: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState("all");
  const [resetTarget, setResetTarget] = useState<Customer | null>(null);

  const { customers, total } = view;

  const rows = useMemo(
    () =>
      customers.filter((c) => {
        const matches =
          !query ||
          [c.name, c.email, c.phone ?? ""].some((v) =>
            v.toLowerCase().includes(query.toLowerCase()),
          );
        const inSegment =
          segment === "all" ||
          (segment === "vendors" && c.isVendor) ||
          (segment === "verified" && isEmailVerified(c)) ||
          (segment === "unverified" && !isEmailVerified(c));
        return matches && inSegment;
      }),
    [customers, query, segment],
  );

  const metrics = useMemo(
    () => [
      { label: "Total customers", value: String(total) },
      { label: "Verified", value: String(customers.filter(isEmailVerified).length) },
      { label: "Vendors", value: String(customers.filter((c) => c.isVendor).length) },
      { label: "Unverified", value: String(customers.filter((c) => !isEmailVerified(c)).length) },
    ],
    [customers, total],
  );

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <div>
        <h1 className="font-heading text-xl font-bold tracking-tight">Customers</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Storefront customer accounts from the commerce API.
        </p>
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
              placeholder="Search name, email or phone..."
              className="h-9 rounded-[10px] bg-muted pl-9 text-xs"
            />
          </div>
          <Select value={segment} onValueChange={setSegment}>
            <SelectTrigger className="h-9 w-full rounded-[10px] text-xs sm:w-44">
              <Filter className="size-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All customers</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
              <SelectItem value="vendors">Vendors</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-[11px] font-medium text-muted-foreground">{rows.length} customers</span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Customer</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Phone</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Verified</TableHead>
                <TableHead className="h-10 text-right text-[10px] font-bold uppercase tracking-wider">Orders / Reviews</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Joined</TableHead>
                {canManage ? <TableHead className="h-10 w-10" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id} className="h-16">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback>{customerInitials(c.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">{c.name}</p>
                          {c.isVendor ? <Badge variant="outline" className="text-[10px]">Vendor</Badge> : null}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{c.phone ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge variant={isEmailVerified(c) ? "success" : "neutral"}>
                      {isEmailVerified(c) ? "Verified" : "Unverified"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                    {c.reviewsCount ?? 0} reviews · {c.wishlistItemsCount ?? 0} saved
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${c.name}`}>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onSelect={() => setResetTarget(c)}>
                            <KeyRound className="size-4" />
                            Reset password
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 6 : 5} className="h-32 text-center text-sm text-muted-foreground">
                    <CheckCircle2 className="mx-auto mb-2 size-6 opacity-40" />
                    No customers match your filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ResetPasswordDialog customer={resetTarget} onClose={() => { setResetTarget(null); router.refresh(); }} />
    </PageContainer>
  );
}
