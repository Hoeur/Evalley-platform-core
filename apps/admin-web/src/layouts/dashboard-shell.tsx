import type { DashboardLayoutProps } from "./layout.types";
import { layoutRegistry } from "./layout-registry";
import type { LayoutType } from "@/clients/client.types";
export function DashboardShell({ layout, ...props }: DashboardLayoutProps & { layout: LayoutType }) { const Layout = layoutRegistry[layout]; return <Layout {...props} />; }
