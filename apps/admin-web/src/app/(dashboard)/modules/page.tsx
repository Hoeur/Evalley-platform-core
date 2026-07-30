import { resolveClient } from "@/clients/client-resolver.server";
import {
  ecommerceModuleCapabilities,
  isEcommerceModuleKey,
} from "@platform/ecommerce-core";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { ModuleMarketplace } from "@/features/modules/components/module-marketplace";
import { getEnabledModules } from "@/modules/enabled-modules.server";
import { moduleRules } from "@/modules/module-catalog";
import { moduleRegistry } from "@/modules/module-registry";

export default async function ModulesPage() {
  await requireModuleAccess("modules", "modules.manage");
  const client = resolveClient().public;
  const apiAdapter = resolveClient().server.api.adapter;
  const enabledModules = await getEnabledModules(client);
  const modules = client.availableModules.map((key) => {
    const definition = moduleRegistry.find((item) => item.key === key);
    if (!definition) throw new Error(`Missing module registry definition for ${key}`);
    const capability =
      apiAdapter === "standard" && isEcommerceModuleKey(key)
        ? ecommerceModuleCapabilities[key]
        : undefined;
    return {
      key,
      label: definition.label,
      description: definition.description ?? `${definition.label} tools and operational workflows.`,
      group: definition.navigationGroup,
      dependencies: moduleRules[key].dependencies,
      locked: moduleRules[key].locked ?? false,
      enabled: enabledModules.includes(key),
      enabledByDefault: client.modules.includes(key),
      backendRequired: capability?.status === "backend-required",
      backendReason:
        capability && "reason" in capability ? capability.reason : undefined,
    };
  });

  return <ModuleMarketplace clientName={client.brand.shortName} modules={modules} />;
}
