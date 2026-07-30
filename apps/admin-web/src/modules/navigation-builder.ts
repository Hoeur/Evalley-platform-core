import type { ModuleKey } from "@/clients/client.types";
import type { Permission } from "@/core/auth/permissions";
import { moduleRegistry } from "./module-registry";
import { filterModulesByPermission } from "./permission-filter";
import type { NavigationGroup } from "./module.types";

export function buildNavigation(enabled: ModuleKey[], permissions: Permission[]): NavigationGroup[] {
  const visible = filterModulesByPermission(
    moduleRegistry.filter((module) => enabled.includes(module.key)).sort((a, b) => a.order - b.order),
    permissions,
  );
  return Array.from(new Set(visible.map((module) => module.navigationGroup))).map((label) => ({
    label,
    items: visible.filter((module) => module.navigationGroup === label),
  }));
}
