"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CircleHelp, Plus, Search } from "lucide-react";
import type { ClientPublicConfig } from "@/clients/client.types";
import type { SessionUser } from "@/core/auth/session.types";
import { UserMenu } from "@/components/navigation/user-menu";
import { Button } from "@/design-system/ui/button";
import { Input } from "@/design-system/ui/input";
import { MobileNavigation } from "./sidebar/mobile-navigation";

type HeaderGroup = {
  label: string;
  items: {
    key: string;
    label: string;
    href: string;
    icon?: React.ReactNode;
    badge?: string;
  }[];
};

const descriptions: Record<string, string> = {
  dashboard: "Welcome back — here's today's snapshot",
  analytics: "Sales, catalog, customer and marketplace reports",
  products: "Manage your complete product catalog",
  variants: "Per-variation SKU, price and stock",
  attributes: "Reusable attribute sets and product options",
  inventory: "Stock levels across warehouses",
  categories: "Organize how customers browse",
  promotions: "Campaigns, flash sales and coupon codes",
  reviews: "Moderate customer feedback",
  orders: "Review orders and fulfillment progress",
  returns: "Manage open return requests",
  shipments: "Track carrier fulfillment and labels",
  customers: "Registered shopper profiles and value",
  vendors: "Marketplace seller operations",
  withdrawals: "Approve and process payout requests",
  ledger: "Platform commission and vendor balances",
  settings: "Store configuration and preferences",
};

export function DashboardHeaderContent({
  client,
  user,
  groups,
}: {
  client: ClientPublicConfig;
  user: SessionUser;
  groups: HeaderGroup[];
}) {
  const pathname = usePathname();
  const active = groups
    .flatMap((group) => group.items)
    .find(
      (item) =>
        pathname === item.href ||
        (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)),
    );
  const title = active?.label ?? "Dashboard";
  const routeKey = active?.key ?? "dashboard";
  return (
    <header className="bg-card sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-4 md:px-7">
      <MobileNavigation
        brandShort={client.brand.shortName}
        groups={groups}
        user={{ name: user.name, role: user.role }}
      />
      <div className="min-w-0 flex-1 lg:flex-none">
        <p className="font-heading truncate text-[17px] leading-tight font-bold tracking-tight">
          {title}
        </p>
        <p className="text-muted-foreground truncate text-[11px]">
          {descriptions[routeKey] ?? "Operations workspace"}
        </p>
      </div>
      <div className="relative hidden w-full max-w-[420px] items-center lg:flex">
        <Search className="text-muted-foreground pointer-events-none absolute left-3 size-[18px]" />
        <Input
          aria-label="Global search"
          placeholder="Search orders, products, customers..."
          className="bg-muted h-10 rounded-xl pr-14 pl-10 text-xs"
        />
        <kbd className="bg-card text-muted-foreground absolute right-2.5 rounded-md border px-1.5 py-0.5 text-[9px] font-semibold">
          Ctrl K
        </kbd>
      </div>
      <div className="hidden flex-1 lg:block" />
      {client.modules.includes("products") && (
        <Button
          asChild
          className="hidden h-10 rounded-xl px-4 text-xs font-bold shadow-sm sm:inline-flex"
        >
          <Link href="/products/new">
            <Plus className="size-4" />
            Create
          </Link>
        </Button>
      )}
      <Button
        variant="outline"
        size="icon"
        className="bg-card relative size-10 rounded-xl"
        aria-label="Notifications"
      >
        <Bell className="size-[18px]" />
        <span className="bg-primary ring-card absolute top-2 right-2 size-1.5 rounded-full ring-2" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="bg-card hidden size-10 rounded-xl sm:inline-flex"
        aria-label="Help"
      >
        <CircleHelp className="size-[18px]" />
      </Button>
      <UserMenu user={user} />
    </header>
  );
}
