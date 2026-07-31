import { hasPermission } from "@/core/auth/permissions";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { PromotionsWorkspace } from "@/features/promotions/components/promotions-workspace";
import { getPromotionsData } from "@/features/promotions/api/promotions.server";

export default async function PromotionsPage() {
  const { user } = await requireModuleAccess("promotions", "promotions.read");
  const view = await getPromotionsData();
  return (
    <PromotionsWorkspace
      view={view}
      canManage={hasPermission(user.permissions, "promotions.manage")}
    />
  );
}
