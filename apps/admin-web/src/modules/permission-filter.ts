import { hasPermission, type Permission } from "@/core/auth/permissions";
import type { AdminModuleDefinition } from "./module.types";

export function filterModulesByPermission(modules: AdminModuleDefinition[], permissions: Permission[]) {
  return modules.filter((module) => hasPermission(permissions, module.permission));
}
