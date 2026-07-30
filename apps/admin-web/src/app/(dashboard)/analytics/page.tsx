import { requireModuleAccess } from "@/core/auth/authorize.server";
import { AnalyticsWorkspace } from "@/features/evalley";

export default async function AnalyticsPage() { await requireModuleAccess("analytics", "analytics.read"); return <AnalyticsWorkspace />; }
