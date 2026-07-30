import type { LucideIcon } from "lucide-react";
import type { ModuleKey } from "@/clients/client.types";
import type { Permission } from "@/core/auth/permissions";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { ModulePlaceholder } from "./module-placeholder";

export async function ProtectedModulePage({ module, permission, title, description, icon }: { module: ModuleKey; permission: Permission; title: string; description: string; icon: LucideIcon }) {
  await requireModuleAccess(module, permission);
  return <ModulePlaceholder title={title} description={description} icon={icon} />;
}
