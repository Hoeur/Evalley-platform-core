import type { LucideIcon } from "lucide-react";
import type { ModuleKey } from "@/clients/client.types";
import type { Permission } from "@/core/auth/permissions";

export type NavigationItem = { key: string; label: string; href: string; icon: LucideIcon; permission?: Permission; badge?: string };
export type NavigationGroup = { label: string; items: NavigationItem[] };
export type AdminModuleDefinition = NavigationItem & {
  key: ModuleKey; description?: string; navigationGroup: string; order: number;
  children?: NavigationItem[];
};
