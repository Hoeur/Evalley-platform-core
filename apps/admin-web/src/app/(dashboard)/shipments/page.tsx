import { requireModuleAccess } from "@/core/auth/authorize.server";
import { DataWorkspace, workspaceConfigs } from "@/features/evalley";

export default async function ShipmentsPage() { await requireModuleAccess("shipments", "shipments.read"); return <DataWorkspace config={workspaceConfigs.shipments} />; }
