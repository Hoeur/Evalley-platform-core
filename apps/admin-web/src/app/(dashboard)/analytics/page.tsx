import { requireModuleAccess } from "@/core/auth/authorize.server";
import { AnalyticsWorkspace } from "@/features/evalley";
import { getAnalyticsDashboard } from "@/features/evalley/api/ecommerce-workspaces.server";

export default async function AnalyticsPage() {
  await requireModuleAccess("analytics", "analytics.read");
  const snapshot = await getAnalyticsDashboard();
  return <AnalyticsWorkspace snapshot={snapshot} />;
}
