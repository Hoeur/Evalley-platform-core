"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { cn } from "@/core/utils/cn";
import { SidebarLabel } from "./sidebar-frame";

/**
 * Active when this href is the *longest* nav route that matches the current
 * pathname — so a parent like /crm doesn't stay highlighted on /crm/customers.
 */
export function isNavActive(
  pathname: string,
  href: string,
  hrefs?: readonly string[],
) {
  const candidates = (hrefs && hrefs.length ? hrefs : [href]).filter(
    (candidate) =>
      pathname === candidate ||
      (candidate !== "/dashboard" && pathname.startsWith(`${candidate}/`)),
  );
  if (candidates.length === 0) return false;
  const best = candidates.reduce((a, b) => (b.length > a.length ? b : a));
  return best === href;
}

export function SidebarNavLink({
  href,
  label,
  badge,
  hrefs,
  children,
}: {
  href: string;
  label: string;
  badge?: string;
  hrefs?: readonly string[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = useMemo(
    () => isNavActive(pathname, href, hrefs),
    [pathname, href, hrefs],
  );
  return (
    <Link
      href={href}
      className={cn(
        "flex h-10 items-center gap-3 rounded-[10px] px-3 text-[13px] font-medium transition-colors",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground font-bold shadow-[0_4px_12px_color-mix(in_oklab,var(--sidebar-primary)_32%,transparent)]"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      {children}
      <SidebarLabel>
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate">{label}</span>
          {badge && (
            <span
              className={cn(
                "ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold",
                active ? "bg-white/20 text-white" : "bg-sidebar-accent text-primary",
              )}
            >
              {badge}
            </span>
          )}
        </span>
      </SidebarLabel>
    </Link>
  );
}
