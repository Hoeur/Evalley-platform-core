import { requireModuleAccess } from "@/core/auth/authorize.server";
import { DataWorkspace, workspaceConfigs } from "@/features/evalley";

export default async function LedgerPage() { await requireModuleAccess("ledger", "ledger.read"); return <DataWorkspace config={workspaceConfigs.ledger} />; }
