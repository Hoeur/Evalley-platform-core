"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type {
  ShippingCarrier,
  ShippingMethod,
  ShippingZone,
} from "@platform/ecommerce-core";
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
  DialogTrigger,
} from "@/design-system/ui/dialog";
import { Input } from "@/design-system/ui/input";
import { Label } from "@/design-system/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/design-system/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/design-system/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/design-system/ui/alert-dialog";
import type { ShippingData } from "../api/shipping.server";
import {
  createCarrierAction,
  createZoneAction,
  deleteCarrierAction,
  deleteMethodAction,
  deleteZoneAction,
} from "../api/shipping.mutations";

function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <StatusBadge variant={active ? "success" : "neutral"}>
      {active ? "Active" : "Inactive"}
    </StatusBadge>
  );
}

function DeleteButton({
  label,
  onConfirm,
  pending,
}: {
  label: string;
  onConfirm: () => void;
  pending: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" disabled={pending}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AddCarrierDialog({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [tracking, setTracking] = useState("");

  function submit() {
    if (!name.trim() || !code.trim()) {
      toast.error("Name and code are required.");
      return;
    }
    startTransition(async () => {
      const result = await createCarrierAction({
        name: name.trim(),
        code: code.trim(),
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        trackingUrlTemplate: tracking.trim() || undefined,
      });
      if (result.ok) {
        toast.success("Carrier created");
        setOpen(false);
        setName("");
        setCode("");
        setPhone("");
        setWebsite("");
        setTracking("");
        onDone();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 rounded-[10px] text-xs">
          <Plus className="size-4" />
          Add carrier
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New carrier</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="carrier-name">Name</Label>
            <Input id="carrier-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="J&T Express" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="carrier-code">Code</Label>
            <Input id="carrier-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="jt-express" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="carrier-phone">Phone</Label>
            <Input id="carrier-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+855 23 999 888" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="carrier-website">Website</Label>
            <Input id="carrier-website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="carrier-tracking">Tracking URL template</Label>
            <Input id="carrier-tracking" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="https://.../track?number={tracking_number}" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddZoneDialog({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [countries, setCountries] = useState("");
  const [states, setStates] = useState("");
  const [priority, setPriority] = useState("0");

  function submit() {
    const countryCodes = countries
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);
    if (!name.trim() || countryCodes.length === 0) {
      toast.error("Name and at least one country code are required.");
      return;
    }
    const stateList = states
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    startTransition(async () => {
      const result = await createZoneAction({
        name: name.trim(),
        countryCodes,
        states: stateList.length ? stateList : undefined,
        priority: Number(priority) || 0,
      });
      if (result.ok) {
        toast.success("Zone created");
        setOpen(false);
        setName("");
        setCountries("");
        setStates("");
        setPriority("0");
        onDone();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 rounded-[10px] text-xs">
          <Plus className="size-4" />
          Add zone
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New shipping zone</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="zone-name">Name</Label>
            <Input id="zone-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Phnom Penh" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="zone-countries">Country codes (comma separated)</Label>
            <Input id="zone-countries" value={countries} onChange={(e) => setCountries(e.target.value)} placeholder="KH, TH" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="zone-states">States (optional, comma separated)</Label>
            <Input id="zone-states" value={states} onChange={(e) => setStates(e.target.value)} placeholder="Phnom Penh" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="zone-priority">Priority</Label>
            <Input id="zone-priority" type="number" value={priority} onChange={(e) => setPriority(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ShippingWorkspace({
  data,
  canManage,
}: {
  data: ShippingData;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const zoneNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const zone of data.zones) map.set(zone.id, zone.name);
    return map;
  }, [data.zones]);

  function runDelete(action: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success("Deleted");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete");
      }
    });
  }

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <div>
        <h1 className="font-heading text-xl font-bold tracking-tight">
          Shipping
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Carriers, delivery zones and methods, live from the commerce API.
        </p>
      </div>

      <Tabs defaultValue="carriers">
        <TabsList className="h-10 rounded-xl">
          <TabsTrigger value="carriers">
            Carriers ({data.carriers.length})
          </TabsTrigger>
          <TabsTrigger value="zones">Zones ({data.zones.length})</TabsTrigger>
          <TabsTrigger value="methods">
            Methods ({data.methods.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="carriers" className="space-y-3">
          {canManage ? (
            <div className="flex justify-end">
              <AddCarrierDialog onDone={() => router.refresh()} />
            </div>
          ) : null}
          <Card className="overflow-hidden rounded-2xl shadow-none">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Status</TableHead>
                  {canManage ? <TableHead /> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.carriers.map((carrier: ShippingCarrier) => (
                  <TableRow key={carrier.id} className="h-14">
                    <TableCell className="font-semibold">{carrier.name}</TableCell>
                    <TableCell className="font-mono text-[11px]">
                      {carrier.code}
                    </TableCell>
                    <TableCell className="text-xs">
                      {carrier.phone ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {carrier.website ?? "—"}
                    </TableCell>
                    <TableCell>
                      <ActiveBadge active={carrier.isActive} />
                    </TableCell>
                    {canManage ? (
                      <TableCell className="text-right">
                        <DeleteButton
                          label={carrier.name}
                          pending={pending}
                          onConfirm={() =>
                            runDelete(() => deleteCarrierAction(carrier.id))
                          }
                        />
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
                {data.carriers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canManage ? 6 : 5}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      No carriers yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="zones" className="space-y-3">
          {canManage ? (
            <div className="flex justify-end">
              <AddZoneDialog onDone={() => router.refresh()} />
            </div>
          ) : null}
          <Card className="overflow-hidden rounded-2xl shadow-none">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead>Name</TableHead>
                  <TableHead>Countries</TableHead>
                  <TableHead>States</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  {canManage ? <TableHead /> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.zones.map((zone: ShippingZone) => (
                  <TableRow key={zone.id} className="h-14">
                    <TableCell className="font-semibold">{zone.name}</TableCell>
                    <TableCell className="text-xs">
                      {zone.countryCodes.join(", ") || "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {zone.states.length ? zone.states.join(", ") : "All"}
                    </TableCell>
                    <TableCell className="text-xs">{zone.priority}</TableCell>
                    <TableCell>
                      <ActiveBadge active={zone.isActive} />
                    </TableCell>
                    {canManage ? (
                      <TableCell className="text-right">
                        <DeleteButton
                          label={zone.name}
                          pending={pending}
                          onConfirm={() =>
                            runDelete(() => deleteZoneAction(zone.id))
                          }
                        />
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
                {data.zones.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canManage ? 6 : 5}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      No zones yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-3">
          <Card className="overflow-hidden rounded-2xl shadow-none">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead>Method</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Rate type</TableHead>
                  <TableHead className="text-right">Base rate</TableHead>
                  <TableHead>Status</TableHead>
                  {canManage ? <TableHead /> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.methods.map((method: ShippingMethod) => (
                  <TableRow key={method.id} className="h-14">
                    <TableCell className="font-semibold">
                      {method.name || `Method #${method.id}`}
                    </TableCell>
                    <TableCell className="font-mono text-[11px]">
                      {method.code}
                    </TableCell>
                    <TableCell className="text-xs">
                      {zoneNames.get(method.zoneId) ?? `#${method.zoneId}`}
                    </TableCell>
                    <TableCell className="text-xs">
                      {method.carrier?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs capitalize">
                      {method.rateType}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {money(method.baseRate)}
                    </TableCell>
                    <TableCell>
                      <ActiveBadge active={method.isActive} />
                    </TableCell>
                    {canManage ? (
                      <TableCell className="text-right">
                        <DeleteButton
                          label={method.name || method.code}
                          pending={pending}
                          onConfirm={() =>
                            runDelete(() => deleteMethodAction(method.id))
                          }
                        />
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
                {data.methods.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canManage ? 8 : 7}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      No shipping methods yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
