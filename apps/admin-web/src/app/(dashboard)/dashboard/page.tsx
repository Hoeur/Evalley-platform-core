import { requirePermission } from "@/core/auth/authorize.server";
import { PageContainer } from "@/components/page/page-container";
import { DashboardCharts, OperationsPanels, SummaryCards, mockDashboardRepository } from "@/features/dashboard";
export default async function DashboardPage() { const [, data] = await Promise.all([requirePermission("dashboard.read"), mockDashboardRepository.getOverview()]); return <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7"><SummaryCards metrics={data.metrics} /><DashboardCharts revenue={data.revenue} orderStatuses={data.orderStatuses} /><OperationsPanels recentOrders={data.recentOrders} topProducts={data.topProducts} lowStock={data.lowStock} /></PageContainer>; }
