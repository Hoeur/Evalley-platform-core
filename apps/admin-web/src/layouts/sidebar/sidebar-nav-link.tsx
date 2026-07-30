"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/core/utils/cn";
import { SidebarLabel } from "./sidebar-frame";

export function SidebarNavLink({ href, label, badge, children }: { href: string; label: string; badge?: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
  return <Link href={href} className={cn("flex h-10 items-center gap-3 rounded-[10px] px-3 text-[13px] font-medium transition-colors", active ? "bg-sidebar-primary font-bold text-sidebar-primary-foreground shadow-[0_4px_12px_color-mix(in_oklab,var(--sidebar-primary)_32%,transparent)]" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}>{children}<SidebarLabel><span className="flex min-w-0 flex-1 items-center gap-2"><span className="truncate">{label}</span>{badge && <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold", active ? "bg-white/20 text-white" : "bg-sidebar-accent text-primary")}>{badge}</span>}</span></SidebarLabel></Link>;
}
