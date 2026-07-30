import "server-only";
import { cookies } from "next/headers";
import {
  ecommerceModuleCapabilities,
  isEcommerceModuleKey,
} from "@platform/ecommerce-core";
import { resolveClient } from "@/clients/client-resolver.server";
import type { ClientPublicConfig, ModuleKey } from "@/clients/client.types";
import { collectDependencies, moduleRules } from "./module-catalog";

export function modulePreferenceCookieName(clientKey: string) {
  return `dashboard-modules-${clientKey}`;
}

export function normalizeEnabledModules(values: readonly string[], client: ClientPublicConfig) {
  const available = client.availableModules;
  const enabled = new Set<ModuleKey>(
    values.filter((value): value is ModuleKey => available.includes(value as ModuleKey)),
  );

  for (const key of available) {
    if (moduleRules[key].locked) enabled.add(key);
  }

  for (const key of [...enabled]) {
    for (const dependency of collectDependencies(key, available)) enabled.add(dependency);
  }

  return available.filter((key) => enabled.has(key));
}

export function filterEnabledModulesByApi(
  modules: ModuleKey[],
  adapter: "mock" | "standard" | "legacy",
) {
  return adapter !== "standard"
    ? modules
    : modules.filter(
        (module) =>
          !isEcommerceModuleKey(module) ||
          ecommerceModuleCapabilities[module].status === "available",
      );
}

export async function getEnabledModules(client = resolveClient().public) {
  const adapter = resolveClient().server.api.adapter;
  const cookieStore = await cookies();
  const stored = cookieStore.get(modulePreferenceCookieName(client.key))?.value;

  if (!stored) return filterEnabledModulesByApi(normalizeEnabledModules(client.modules, client), adapter);

  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(stored));
    if (!Array.isArray(parsed) || !parsed.every((value) => typeof value === "string")) {
      return normalizeEnabledModules(client.modules, client);
    }
    return filterEnabledModulesByApi(normalizeEnabledModules(parsed, client), adapter);
  } catch {
    return filterEnabledModulesByApi(normalizeEnabledModules(client.modules, client), adapter);
  }
}
