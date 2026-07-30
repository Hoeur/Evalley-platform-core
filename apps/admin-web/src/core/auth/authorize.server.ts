import "server-only";
import { forbidden, notFound } from "next/navigation";
import { hasPermission, type Permission } from "./permissions";
import { requireSession } from "./session.server";
import { resolveClient } from "@/clients/client-resolver.server";
import type { ModuleKey } from "@/clients/client.types";
import { getEnabledModules } from "@/modules/enabled-modules.server";

export async function requirePermission(permission: Permission) {
  const session = await requireSession();
  if (!hasPermission(session.user.permissions, permission)) forbidden();
  return session;
}

export async function requireModuleAccess(module: ModuleKey, permission: Permission) {
  const client = resolveClient().public;
  const enabledModules = await getEnabledModules(client);
  if (!enabledModules.includes(module)) notFound();
  return requirePermission(permission);
}
