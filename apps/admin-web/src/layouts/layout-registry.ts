import type { LayoutType } from "@/clients/client.types";
import { CompactLayout } from "./compact/compact-layout";
import { SidebarLayout } from "./sidebar/sidebar-layout";
import { TopbarLayout } from "./topbar/topbar-layout";
export const layoutRegistry = { sidebar: SidebarLayout, compact: CompactLayout, topbar: TopbarLayout } satisfies Record<LayoutType, typeof SidebarLayout>;
