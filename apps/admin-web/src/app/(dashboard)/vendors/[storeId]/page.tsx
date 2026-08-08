import { notFound } from "next/navigation";
import { hasPermission } from "@/core/auth/permissions";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { VendorDetailWorkspace } from "@/features/vendors/components/vendor-detail-workspace";
import { getVendorDetail } from "@/features/vendors/api/vendors.server";

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { user } = await requireModuleAccess("vendors", "vendors.read");
  const { storeId } = await params;
  const detail = await getVendorDetail(storeId).catch(() => null);
  if (!detail) notFound();
  return (
    <VendorDetailWorkspace
      detail={detail}
      canManage={hasPermission(user.permissions, "vendors.manage")}
    />
  );
}
