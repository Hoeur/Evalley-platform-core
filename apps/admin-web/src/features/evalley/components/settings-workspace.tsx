"use client";

import {
  Bell,
  CheckCircle2,
  CreditCard,
  Globe,
  Mail,
  Palette,
  Receipt,
  RotateCcw,
  Save,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { ImagePicker } from "@/components/forms/image-picker";
import { PageContainer } from "@/components/page/page-container";
import { Badge } from "@/design-system/ui/badge";
import { Button } from "@/design-system/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system/ui/card";
import { Input } from "@/design-system/ui/input";
import { Label } from "@/design-system/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/ui/select";
import { Separator } from "@/design-system/ui/separator";
import { Switch } from "@/design-system/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/design-system/ui/tabs";
import { cn } from "@/core/utils/cn";

/* -------------------------------------------------------------------------- */
/*  Dirty-state plumbing                                                       */
/*  Any field that changes calls markDirty(); the sticky action bar appears    */
/*  and Save / Discard become available. Discard remounts the forms via a key. */
/* -------------------------------------------------------------------------- */

const DirtyContext = createContext<() => void>(() => {});
const useMarkDirty = () => useContext(DirtyContext);

const TABS = [
  { value: "general", label: "General", icon: Store },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "shipping", label: "Shipping", icon: Truck },
  { value: "payments", label: "Payments", icon: CreditCard },
  { value: "taxes", label: "Taxes", icon: Receipt },
  { value: "security", label: "Security", icon: ShieldCheck },
] as const;

type TabValue = (typeof TABS)[number]["value"];

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                      */
/* -------------------------------------------------------------------------- */

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="flex-row items-start gap-3 space-y-0">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <div className="space-y-1">
          <CardTitle className="font-heading text-base">{title}</CardTitle>
          {description ? (
            <CardDescription className="text-xs">{description}</CardDescription>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Field({
  id,
  label,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  defaultChecked = false,
  badges,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
  badges?: readonly string[];
}) {
  const markDirty = useMarkDirty();
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-4 last:border-0">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">{label}</p>
          {badges?.map((b) => (
            <Badge key={b} variant="secondary" className="text-[10px] font-normal">
              {b}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={(v) => {
          setChecked(v);
          markDirty();
        }}
        aria-label={label}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tab panels                                                                 */
/* -------------------------------------------------------------------------- */

function GeneralPanel() {
  const markDirty = useMarkDirty();
  const [logo, setLogo] = useState<File | undefined>();
  const [favicon, setFavicon] = useState<File | undefined>();
  return (
    <div className="grid gap-4">
      <SectionCard
        icon={Palette}
        title="Branding"
        description="Your logo and store identity, shown across the storefront and admin."
      >
        <div className="grid gap-6 sm:grid-cols-[minmax(0,220px)_1fr]">
          <div className="space-y-2">
            <Label>Store logo</Label>
            <ImagePicker
              file={logo}
              label="store logo"
              hint="PNG, SVG or WEBP · 512×512 recommended"
              onChange={(f) => {
                setLogo(f);
                markDirty();
              }}
            />
          </div>
          <div className="space-y-4">
            <Field id="store-name" label="Store name">
              <Input id="store-name" defaultValue="Evalley Marketplace" onChange={markDirty} />
            </Field>
            <Field
              id="store-tagline"
              label="Tagline"
              hint="A short line shown under your logo."
            >
              <Input
                id="store-tagline"
                defaultValue="Everything your business needs, in one place."
                onChange={markDirty}
              />
            </Field>
            <Field id="store-url" label="Store URL">
              <Input id="store-url" defaultValue="https://evalley.com" onChange={markDirty} />
            </Field>
          </div>
        </div>
        <Separator className="my-5" />
        <div className="grid gap-6 sm:grid-cols-[minmax(0,220px)_1fr]">
          <div className="space-y-2">
            <Label>Favicon</Label>
            <ImagePicker
              file={favicon}
              label="favicon"
              hint="ICO or PNG · 32×32"
              onChange={(f) => {
                setFavicon(f);
                markDirty();
              }}
            />
          </div>
          <p className="self-center text-xs text-muted-foreground">
            The favicon appears in browser tabs and bookmarks. Use a simple,
            high-contrast mark so it stays legible at small sizes.
          </p>
        </div>
      </SectionCard>

      <SectionCard
        icon={Store}
        title="Store details"
        description="Contact information and marketplace defaults."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="support-email" label="Support email" hint="Shown to customers on receipts and emails.">
            <Input
              id="support-email"
              type="email"
              defaultValue="support@evalley.com"
              onChange={markDirty}
            />
          </Field>
          <Field id="phone" label="Support phone">
            <Input id="phone" type="tel" defaultValue="+66 2 000 0000" onChange={markDirty} />
          </Field>
          <Field id="currency" label="Default currency">
            <Select defaultValue="USD" onValueChange={markDirty}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD — US Dollar</SelectItem>
                <SelectItem value="EUR">EUR — Euro</SelectItem>
                <SelectItem value="GBP">GBP — British Pound</SelectItem>
                <SelectItem value="THB">THB — Thai Baht</SelectItem>
                <SelectItem value="KHR">KHR — Cambodian Riel</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field id="timezone" label="Timezone">
            <Select defaultValue="Asia/Bangkok" onValueChange={markDirty}>
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Bangkok">Asia/Bangkok (UTC+7)</SelectItem>
                <SelectItem value="Asia/Phnom_Penh">Asia/Phnom_Penh (UTC+7)</SelectItem>
                <SelectItem value="Asia/Singapore">Asia/Singapore (UTC+8)</SelectItem>
                <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                <SelectItem value="America/New_York">America/New_York (UTC−5)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </SectionCard>

      <SectionCard
        icon={Globe}
        title="Storefront behavior"
        description="Control how shoppers interact with your marketplace."
      >
        <ToggleRow
          label="Guest checkout"
          description="Allow purchases without creating an account."
          defaultChecked={false}
        />
        <ToggleRow
          label="Customer reviews"
          description="Require approval before reviews go live."
          defaultChecked
        />
        <ToggleRow
          label="Maintenance mode"
          description="Temporarily hide the storefront from shoppers."
          defaultChecked={false}
        />
      </SectionCard>
    </div>
  );
}

function NotificationsPanel() {
  return (
    <SectionCard
      icon={Bell}
      title="Notification preferences"
      description="Choose which events send email and push alerts."
    >
      <ToggleRow
        label="New order"
        description="When an order is placed."
        badges={["Email", "Push"]}
        defaultChecked
      />
      <ToggleRow
        label="Order status changes"
        description="Notify customers on fulfillment updates."
        badges={["Email"]}
        defaultChecked
      />
      <ToggleRow
        label="Abandoned cart"
        description="Remind shoppers after 24 hours."
        badges={["Email"]}
        defaultChecked={false}
      />
      <ToggleRow
        label="Weekly summary"
        description="Sales digest every Monday morning."
        badges={["Email"]}
        defaultChecked
      />
      <ToggleRow
        label="Back in stock"
        description="Alert waitlisted customers when inventory returns."
        badges={["Email", "Push"]}
        defaultChecked
      />
    </SectionCard>
  );
}

function ShippingPanel() {
  const markDirty = useMarkDirty();
  return (
    <SectionCard
      icon={Truck}
      title="Shipping"
      description="Default rates and delivery policies for new orders."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="free-shipping" label="Free shipping threshold" hint="Set to 0 to disable.">
          <Input id="free-shipping" type="number" defaultValue={75} onChange={markDirty} />
        </Field>
        <Field id="flat-rate" label="Flat rate">
          <Input id="flat-rate" type="number" defaultValue={6} onChange={markDirty} />
        </Field>
      </div>
      <Separator className="my-4" />
      <ToggleRow
        label="Local pickup"
        description="Let customers collect orders in person."
        defaultChecked
      />
      <ToggleRow
        label="Require signature on delivery"
        description="For orders above the free-shipping threshold."
        defaultChecked={false}
      />
    </SectionCard>
  );
}

const PROVIDERS = [
  { name: "Stripe", desc: "Cards, wallets and local methods.", connected: true },
  { name: "PayPal", desc: "PayPal balance and guest checkout.", connected: true },
  { name: "Cash on delivery", desc: "Collect payment on handover.", connected: false },
] as const;

function PaymentsPanel() {
  const markDirty = useMarkDirty();
  return (
    <SectionCard
      icon={CreditCard}
      title="Payment providers"
      description="Connect the gateways customers can pay with."
    >
      <div className="grid gap-3">
        {PROVIDERS.map((p) => (
          <div
            key={p.name}
            className="flex items-center justify-between gap-4 rounded-xl border border-border/60 p-4"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{p.name}</p>
                {p.connected ? (
                  <Badge className="gap-1 bg-success/15 text-success" variant="secondary">
                    <CheckCircle2 className="size-3" /> Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-muted-foreground">
                    Not connected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </div>
            <Button
              variant={p.connected ? "outline" : "default"}
              size="sm"
              onClick={() => {
                markDirty();
                toast.message(p.connected ? `Manage ${p.name}` : `Connect ${p.name}`);
              }}
            >
              {p.connected ? "Manage" : "Connect"}
            </Button>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function TaxesPanel() {
  const markDirty = useMarkDirty();
  return (
    <SectionCard
      icon={Receipt}
      title="Taxes"
      description="How tax is calculated and displayed at checkout."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="tax-rate" label="Default tax rate (%)">
          <Input id="tax-rate" type="number" defaultValue={7} onChange={markDirty} />
        </Field>
        <Field id="tax-basis" label="Calculate tax on">
          <Select defaultValue="shipping" onValueChange={markDirty}>
            <SelectTrigger id="tax-basis">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shipping">Shipping address</SelectItem>
              <SelectItem value="billing">Billing address</SelectItem>
              <SelectItem value="store">Store address</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Separator className="my-4" />
      <ToggleRow
        label="Prices include tax"
        description="Show tax-inclusive prices on the storefront."
        defaultChecked={false}
      />
      <ToggleRow
        label="Charge tax on shipping"
        description="Apply the tax rate to shipping fees."
        defaultChecked
      />
    </SectionCard>
  );
}

function SecurityPanel() {
  const markDirty = useMarkDirty();
  return (
    <SectionCard
      icon={ShieldCheck}
      title="Security"
      description="Protect administrator accounts and sessions."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="session-timeout" label="Session timeout (minutes)">
          <Input id="session-timeout" type="number" defaultValue={30} onChange={markDirty} />
        </Field>
        <Field id="min-password" label="Minimum password length">
          <Input id="min-password" type="number" defaultValue={12} onChange={markDirty} />
        </Field>
      </div>
      <Separator className="my-4" />
      <ToggleRow
        label="Two-factor authentication"
        description="Require a second factor for all administrators."
        badges={["Recommended"]}
        defaultChecked
      />
      <ToggleRow
        label="Force logout on password change"
        description="End every active session when a password is reset."
        defaultChecked
      />
      <ToggleRow
        label="Login alerts"
        description="Email owners when a new device signs in."
        defaultChecked={false}
      />
    </SectionCard>
  );
}

const PANELS: Record<TabValue, ReactNode> = {
  general: <GeneralPanel />,
  notifications: <NotificationsPanel />,
  shipping: <ShippingPanel />,
  payments: <PaymentsPanel />,
  taxes: <TaxesPanel />,
  security: <SecurityPanel />,
};

/* -------------------------------------------------------------------------- */
/*  Workspace                                                                  */
/* -------------------------------------------------------------------------- */

export function SettingsWorkspace() {
  const [active, setActive] = useState<TabValue>("general");
  const [dirty, setDirty] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const markDirty = useMemo(() => () => setDirty(true), []);

  const activeLabel = TABS.find((t) => t.value === active)?.label ?? "";

  const save = () => {
    setDirty(false);
    toast.success(`${activeLabel} settings saved`);
  };

  const discard = () => {
    setDirty(false);
    setFormKey((k) => k + 1); // remount panels → reset to defaults
    toast.message("Changes discarded");
  };

  return (
    <DirtyContext.Provider value={markDirty}>
      <PageContainer className="max-w-[1100px] gap-6 pb-24">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Store configuration, notifications, shipping, payments, taxes and security.
            </p>
          </div>
          {dirty ? (
            <Badge className="gap-1 bg-warning/15 text-warning" variant="secondary">
              Unsaved changes
            </Badge>
          ) : null}
        </header>

        <Tabs
          orientation="vertical"
          value={active}
          onValueChange={(v) => setActive(v as TabValue)}
          className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]"
        >
          <TabsList className="h-fit w-full gap-1 rounded-2xl bg-card p-2 shadow-sm lg:sticky lg:top-6">
            {TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="w-full justify-start gap-2 rounded-xl px-3 py-2 data-active:shadow-sm"
              >
                <Icon className="size-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div key={formKey} className="min-w-0">
            {TABS.map(({ value }) => (
              <TabsContent key={value} value={value} className="mt-0">
                {PANELS[value]}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </PageContainer>

      {/* Sticky action bar — only shown when there are unsaved changes */}
      {dirty ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 p-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4" />
              You have unsaved changes in {activeLabel}.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={discard}>
                <RotateCcw className="size-4" /> Discard
              </Button>
              <Button onClick={save}>
                <Save className="size-4" /> Save changes
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </DirtyContext.Provider>
  );
}
