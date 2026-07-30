import { SidebarLayout } from "../sidebar/sidebar-layout";
import type { DashboardLayoutProps } from "../layout.types";
export function CompactLayout(props: DashboardLayoutProps) { return <SidebarLayout {...props} client={{ ...props.client, layout: { ...props.client.layout, sidebarDefaultCollapsed: true, sidebarCollapsible: false } }} />; }
