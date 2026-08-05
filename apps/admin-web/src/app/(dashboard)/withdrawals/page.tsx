import { requireModuleAccess } from "@/core/auth/authorize.server";
import { DataWorkspace } from "@/features/evalley";
import { getWithdrawalsWorkspace } from "@/features/evalley/api/ecommerce-workspaces.server";

export default async function WithdrawalsPage() {
  await requireModuleAccess("withdrawals", "withdrawals.read");
  return <DataWorkspace config={await getWithdrawalsWorkspace()} />;
}
