import type { ClientPublicConfig } from "@/clients/client.types";
import type { SessionUser } from "@/core/auth/session.types";
import type { NavigationGroup } from "@/modules/module.types";
import { SidebarHeader } from "./sidebar-header";
import { SidebarLabel } from "./sidebar-frame";
import { SidebarNavLink } from "./sidebar-nav-link";
import { SidebarUserMenu } from "./sidebar-user-menu";

export function AppSidebar({ client, navigation, user }: { client: ClientPublicConfig; navigation: NavigationGroup[]; user: SessionUser }) {
  return <div className="flex h-full flex-col"><SidebarHeader client={client} /><nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2">{navigation.map((group) => <div key={group.label}><SidebarLabel><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.13em] text-sidebar-foreground/45">{group.label}</p></SidebarLabel><div className="space-y-0.5">{group.items.map((item) => { const Icon = item.icon; return <SidebarNavLink key={item.key} href={item.href} label={item.label} badge={item.badge}><Icon className="size-[18px] shrink-0" /></SidebarNavLink>; })}</div></div>)}</nav><div className="border-t border-sidebar-border p-3"><SidebarUserMenu user={user} /></div></div>;
}
