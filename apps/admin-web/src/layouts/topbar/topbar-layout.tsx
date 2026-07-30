import Link from "next/link";
import { DashboardHeader } from "../dashboard-header";
import type { DashboardLayoutProps } from "../layout.types";
export function TopbarLayout({ children, navigation, client, user }: DashboardLayoutProps) { return <div className="min-h-screen"><DashboardHeader appearance="brand" client={client} user={user} navigation={navigation} /><nav className="hidden h-12 items-center gap-1 border-b bg-card/80 px-6 shadow-sm md:flex">{navigation.flatMap((group) => group.items).map((item) => <Link key={item.key} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">{item.label}</Link>)}</nav>{children}</div>; }
