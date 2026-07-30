import { DashboardHeader } from "../dashboard-header";
import type { DashboardLayoutProps } from "../layout.types";
import { AppSidebar } from "./app-sidebar";
import { SidebarFrame } from "./sidebar-frame";
export function SidebarLayout({ children, navigation, client, user }: DashboardLayoutProps) { const sidebar = <AppSidebar client={client} navigation={navigation} user={user} />; return <SidebarFrame collapsible={client.layout.sidebarCollapsible} defaultCollapsed={client.layout.sidebarDefaultCollapsed} sidebar={sidebar}><DashboardHeader client={client} user={user} navigation={navigation} />{children}</SidebarFrame>; }
