import { requireModuleAccess } from "@/core/auth/authorize.server";
import { DataWorkspace } from "@/features/evalley";
import { getVendorsWorkspace } from "@/features/evalley/api/ecommerce-workspaces.server";

export default async function VendorsPage() {
  await requireModuleAccess("vendors", "vendors.read");
  return <DataWorkspace config={await getVendorsWorkspace()} />;
}
