import { requireModuleAccess } from "@/core/auth/authorize.server";
import { DataWorkspace, workspaceConfigs } from "@/features/evalley";

export default async function CustomersPage() { await requireModuleAccess("customers", "customers.read"); return <DataWorkspace config={workspaceConfigs.customers} />; }
