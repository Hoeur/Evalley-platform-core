import { requireModuleAccess } from "@/core/auth/authorize.server";
import { DataWorkspace, workspaceConfigs } from "@/features/evalley";

export default async function ReturnsPage() { await requireModuleAccess("returns", "returns.read"); return <DataWorkspace config={workspaceConfigs.returns} />; }
