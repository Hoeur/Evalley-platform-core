"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Plus,
  Radio,
  Search,
  Send,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type {
  BroadcastTargetType,
  NotificationChannel,
  SendBroadcastInput,
} from "@platform/ecommerce-core";
import { PageContainer } from "@/components/page/page-container";
import { Badge } from "@/design-system/ui/badge";
import { Button } from "@/design-system/ui/button";
import { Card, CardContent } from "@/design-system/ui/card";
import { Checkbox } from "@/design-system/ui/checkbox";
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
import { ScrollArea } from "@/design-system/ui/scroll-area";
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
import { Textarea } from "@/design-system/ui/textarea";
import { sendBroadcastAction } from "../api/broadcast.mutations";
import {
  NOTIFICATION_CHANNELS,
  channelLabel,
  targetLabel,
  timeAgo,
  type BroadcastsView,
} from "../notification-utils";

function ComposeBroadcastForm({
  view,
  onDone,
}: {
  view: BroadcastsView;
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetType, setTargetType] = useState<BroadcastTargetType>("all");
  const [groupIds, setGroupIds] = useState<Set<string>>(new Set());
  const [customerIds, setCustomerIds] = useState<Set<string>>(new Set());
  const [customerQuery, setCustomerQuery] = useState("");
  const [url, setUrl] = useState("");
  // in_app is always delivered, so it is checked and locked on.
  const [channels, setChannels] = useState<Set<NotificationChannel>>(
    new Set<NotificationChannel>(["in_app"]),
  );

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return view.customers.slice(0, 50);
    return view.customers
      .filter((c) =>
        [c.name, c.email].some((v) => v.toLowerCase().includes(q)),
      )
      .slice(0, 50);
  }, [view.customers, customerQuery]);

  function toggle<T>(set: Set<T>, value: T): Set<T> {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  }

  function submit() {
    if (!title.trim()) {
      toast.error("Enter a title.");
      return;
    }
    if (!body.trim()) {
      toast.error("Enter a message body.");
      return;
    }
    if (targetType === "groups" && groupIds.size === 0) {
      toast.error("Select at least one customer group.");
      return;
    }
    if (targetType === "customers" && customerIds.size === 0) {
      toast.error("Select at least one customer.");
      return;
    }

    const input: SendBroadcastInput = {
      title: title.trim(),
      body: body.trim(),
      targetType,
      groupIds: targetType === "groups" ? [...groupIds] : undefined,
      customerIds: targetType === "customers" ? [...customerIds] : undefined,
      channels: [...channels],
      data: url.trim() ? { url: url.trim() } : undefined,
    };

    startTransition(async () => {
      const res = await sendBroadcastAction(input);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(
        `Broadcast queued to ${res.broadcast.recipientsCount} recipient${
          res.broadcast.recipientsCount === 1 ? "" : "s"
        }`,
      );
      router.refresh();
      onDone();
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="bc-title">Title</Label>
        <Input
          id="bc-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Khmer New Year sale starts Friday"
          maxLength={255}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bc-body">Message</Label>
        <Textarea
          id="bc-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Up to 40% off electronics all weekend. Tap to browse."
          rows={3}
          maxLength={2000}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bc-target">Audience</Label>
        <Select
          value={targetType}
          onValueChange={(v) => setTargetType(v as BroadcastTargetType)}
        >
          <SelectTrigger id="bc-target">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All customers</SelectItem>
            <SelectItem value="groups">Customer groups</SelectItem>
            <SelectItem value="customers">Selected customers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {targetType === "groups" ? (
        <div className="space-y-1.5">
          <Label>Groups</Label>
          {view.groups.length === 0 ? (
            <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-xs">
              No customer groups available.
            </p>
          ) : (
            <ScrollArea className="rounded-lg border [&_[data-slot=scroll-area-viewport]]:max-h-44">
              <div className="divide-y">
                {view.groups.map((g) => (
                  <label
                    key={g.id}
                    className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 px-3 py-2 text-sm"
                  >
                    <Checkbox
                      checked={groupIds.has(g.id)}
                      onCheckedChange={() =>
                        setGroupIds((s) => toggle(s, g.id))
                      }
                    />
                    <span className="flex-1 truncate">{g.name}</span>
                    {g.customersCount !== null ? (
                      <span className="text-muted-foreground text-[11px]">
                        {g.customersCount}
                      </span>
                    ) : null}
                  </label>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      ) : null}

      {targetType === "customers" ? (
        <div className="space-y-1.5">
          <Label>Customers</Label>
          {view.customers.length === 0 ? (
            <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-xs">
              Customer list unavailable. Send to all customers or a group
              instead.
            </p>
          ) : (
            <>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  value={customerQuery}
                  onChange={(e) => setCustomerQuery(e.target.value)}
                  placeholder="Search name or email..."
                  className="h-9 pl-9 text-xs"
                />
              </div>
              <ScrollArea className="rounded-lg border [&_[data-slot=scroll-area-viewport]]:max-h-44">
                <div className="divide-y">
                  {filteredCustomers.map((c) => (
                    <label
                      key={c.id}
                      className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 px-3 py-2 text-sm"
                    >
                      <Checkbox
                        checked={customerIds.has(c.id)}
                        onCheckedChange={() =>
                          setCustomerIds((s) => toggle(s, c.id))
                        }
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{c.name}</span>
                        <span className="text-muted-foreground block truncate text-[11px]">
                          {c.email}
                        </span>
                      </span>
                    </label>
                  ))}
                  {filteredCustomers.length === 0 ? (
                    <p className="text-muted-foreground px-3 py-4 text-center text-xs">
                      No customers match.
                    </p>
                  ) : null}
                </div>
              </ScrollArea>
              <p className="text-muted-foreground text-[11px]">
                {customerIds.size} selected
              </p>
            </>
          )}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label>Channels</Label>
        <div className="flex flex-wrap gap-3">
          {NOTIFICATION_CHANNELS.map((c) => {
            const locked = c.value === "in_app";
            return (
              <label
                key={c.value}
                className="flex cursor-pointer items-center gap-2 text-xs"
              >
                <Checkbox
                  checked={channels.has(c.value)}
                  disabled={locked}
                  onCheckedChange={() =>
                    setChannels((s) => toggle(s, c.value))
                  }
                />
                <span>{c.label}</span>
                {c.hint ? (
                  <span className="text-muted-foreground text-[10px]">
                    ({c.hint})
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bc-url">Deep link (optional)</Label>
        <Input
          id="bc-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://shop.example.com/collections/sale"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={pending}>
          <Send className="size-4" />
          {pending ? "Sending..." : "Send broadcast"}
        </Button>
      </DialogFooter>
    </div>
  );
}

export function BroadcastsWorkspace({
  view,
  canSend,
}: {
  view: BroadcastsView;
  canSend: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const { broadcasts, total } = view;

  const metrics = useMemo(() => {
    const recipients = broadcasts.reduce((n, b) => n + b.recipientsCount, 0);
    const delivered = broadcasts.reduce(
      (n, b) => n + (b.deliveredCount ?? 0),
      0,
    );
    return [
      { label: "Broadcasts", value: String(total) },
      { label: "Recipients", value: recipients.toLocaleString() },
      { label: "Delivered", value: delivered.toLocaleString() },
      {
        label: "In flight",
        value: Math.max(0, recipients - delivered).toLocaleString(),
      },
    ];
  }, [broadcasts, total]);

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight">
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Broadcast announcements to customers and review what has gone out.
          </p>
        </div>
        {canSend ? (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-9 rounded-[10px] text-xs">
                <Plus className="size-4" />
                New broadcast
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New broadcast</DialogTitle>
                <DialogDescription>
                  Delivery is queued. In-app is always included so the message
                  lands somewhere the customer can return to.
                </DialogDescription>
              </DialogHeader>
              <ComposeBroadcastForm
                view={view}
                onDone={() => setCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="rounded-2xl shadow-none">
            <CardContent className="p-4">
              <p className="text-muted-foreground text-[11px] font-medium">
                {m.label}
              </p>
              <p className="font-heading mt-1 text-2xl font-bold tracking-tight">
                {m.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden rounded-2xl shadow-none">
        <div className="flex items-center gap-2 border-b p-4">
          <Radio className="text-muted-foreground size-4" />
          <p className="text-sm font-semibold">Send history</p>
          <span className="text-muted-foreground ml-auto text-[11px]">
            {broadcasts.length} shown
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="h-10 text-[10px] font-bold tracking-wider uppercase">
                  Broadcast
                </TableHead>
                <TableHead className="h-10 text-[10px] font-bold tracking-wider uppercase">
                  Audience
                </TableHead>
                <TableHead className="h-10 text-[10px] font-bold tracking-wider uppercase">
                  Channels
                </TableHead>
                <TableHead className="h-10 text-right text-[10px] font-bold tracking-wider uppercase">
                  Delivered
                </TableHead>
                <TableHead className="h-10 text-[10px] font-bold tracking-wider uppercase">
                  Sent by
                </TableHead>
                <TableHead className="h-10 text-[10px] font-bold tracking-wider uppercase">
                  When
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {broadcasts.map((b) => (
                <TableRow key={b.id} className="h-14">
                  <TableCell className="max-w-72">
                    <p className="truncate text-sm font-medium">{b.title}</p>
                    <p className="text-muted-foreground truncate text-[11px]">
                      {b.body}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <Users className="text-muted-foreground size-3.5" />
                      {targetLabel(b.targetType)}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {b.recipientsCount.toLocaleString()} recipients
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {b.channels.map((c) => (
                        <Badge
                          key={c}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {channelLabel(c)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums">
                    {b.deliveredCount ?? "—"}
                    <span className="text-muted-foreground">
                      {" "}
                      / {b.recipientsCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    {b.sentBy?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {timeAgo(b.sentAt ?? b.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
              {broadcasts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground h-32 text-center text-sm"
                  >
                    <Megaphone className="mx-auto mb-2 size-6 opacity-40" />
                    No broadcasts sent yet.
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
