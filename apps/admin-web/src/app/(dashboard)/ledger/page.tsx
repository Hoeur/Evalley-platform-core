import { requireModuleAccess } from "@/core/auth/authorize.server";
import { DataWorkspace } from "@/features/evalley";
import { getLedgerWorkspace } from "@/features/evalley/api/ecommerce-workspaces.server";

export default async function LedgerPage() {
  await requireModuleAccess("ledger", "ledger.read");
  return <DataWorkspace config={await getLedgerWorkspace()} />;
}
