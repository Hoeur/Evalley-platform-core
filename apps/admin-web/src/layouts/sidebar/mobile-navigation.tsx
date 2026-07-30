"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { isNavActive } from "./sidebar-nav-link";
import { Button } from "@/design-system/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/design-system/ui/sheet";

type MobileNavItem = {
  key: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
};

export function MobileNavigation({
  brandShort,
  groups,
  user,
}: {
  brandShort: string;
  groups: { label: string; items: MobileNavItem[] }[];
  user: { name: string; role: string };
}) {
  const pathname = usePathname();
  const allHrefs = groups.flatMap((group) => group.items.map((item) => item.href));
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="bg-sidebar text-sidebar-foreground flex w-[280px] flex-col gap-0 p-0"
      >
        <SheetHeader className="border-sidebar-border h-16 shrink-0 justify-center border-b px-5">
          <SheetTitle className="text-sidebar-accent-foreground font-heading text-base font-bold tracking-tight">
            {brandShort}
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-sidebar-foreground/45 mb-2 px-3 text-[10px] font-bold tracking-[0.13em] uppercase">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isNavActive(pathname, item.href, allHrefs);
                  return (
                    <SheetClose asChild key={item.key}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex h-10 items-center gap-3 rounded-[10px] px-3 text-[13px] font-medium transition-colors",
                          active
                            ? "bg-sidebar-primary text-sidebar-primary-foreground font-bold"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        {item.icon}
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold",
                              active
                                ? "bg-white/20 text-white"
                                : "bg-sidebar-accent text-primary",
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SheetClose>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-sidebar-border border-t p-3">
          <div className="bg-sidebar-accent/70 flex items-center gap-3 rounded-xl p-2.5">
            <div className="from-primary to-warning grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sidebar-accent-foreground truncate text-xs font-bold">
                {user.name}
              </p>
              <p className="text-sidebar-foreground/55 truncate text-[10px] capitalize">
                {user.role === "owner" ? "Store owner" : user.role}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
