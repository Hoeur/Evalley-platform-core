import { requireModuleAccess } from "@/core/auth/authorize.server";
import { DataWorkspace, workspaceConfigs } from "@/features/evalley";

export default async function VendorsPage() { await requireModuleAccess("vendors", "vendors.read"); return <DataWorkspace config={workspaceConfigs.vendors} />; }
