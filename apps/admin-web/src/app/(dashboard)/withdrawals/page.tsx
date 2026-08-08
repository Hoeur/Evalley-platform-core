import { hasPermission } from "@/core/auth/permissions";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { WithdrawalsWorkspace } from "@/features/withdrawals/components/withdrawals-workspace";
import { getWithdrawals } from "@/features/withdrawals/api/withdrawals.server";

export default async function WithdrawalsPage() {
  const { user } = await requireModuleAccess("withdrawals", "withdrawals.read");
  const page = await getWithdrawals();
  return (
    <WithdrawalsWorkspace
      withdrawals={page.items}
      total={page.total}
      canManage={hasPermission(user.permissions, "withdrawals.manage")}
    />
  );
}
