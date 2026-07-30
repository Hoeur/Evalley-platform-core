import { ChevronsUpDown } from "lucide-react";
import type { ClientPublicConfig } from "@/clients/client.types";
import type { SessionUser } from "@/core/auth/session.types";
import type { NavigationGroup } from "@/modules/module.types";
import { SidebarHeader } from "./sidebar-header";
import { SidebarLabel } from "./sidebar-frame";
import { SidebarNavLink } from "./sidebar-nav-link";

export function AppSidebar({ client, navigation, user }: { client: ClientPublicConfig; navigation: NavigationGroup[]; user: SessionUser }) {
  const initials = user.name.split(" ").map((part) => part[0]).slice(0, 2).join("");
  return <div className="flex h-full flex-col"><SidebarHeader client={client} /><nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2">{navigation.map((group) => <div key={group.label}><SidebarLabel><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.13em] text-sidebar-foreground/45">{group.label}</p></SidebarLabel><div className="space-y-0.5">{group.items.map((item) => { const Icon = item.icon; return <SidebarNavLink key={item.key} href={item.href} label={item.label} badge={item.badge}><Icon className="size-[18px] shrink-0" /></SidebarNavLink>; })}</div></div>)}</nav><div className="border-t border-sidebar-border p-3"><div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/70 p-2.5"><div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-warning text-xs font-bold text-white">{initials}</div><SidebarLabel><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-sidebar-accent-foreground">{user.name}</p><p className="truncate text-[10px] capitalize text-sidebar-foreground/55">{user.role === "owner" ? "Store owner" : user.role}</p></div></SidebarLabel><SidebarLabel><ChevronsUpDown className="size-4 text-sidebar-foreground/50" /></SidebarLabel></div></div></div>;
}
