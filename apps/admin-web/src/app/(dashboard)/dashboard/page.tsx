import { requirePermission } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { PageContainer } from "@/components/page/page-container";
import {
  DashboardCharts,
  OperationsPanels,
  SummaryCards,
  mockDashboardRepository,
} from "@/features/dashboard";
import type { LowStockProduct } from "@/features/dashboard";

async function getLowStock(fallback: LowStockProduct[]): Promise<LowStockProduct[]> {
  try {
    const report = await getEcommerceCore().inventory.reportLowStock({
      perPage: 6,
    });
    if (report.items.length === 0) return fallback;
    return report.items.map((item) => ({
      id: item.productId,
      name: item.productName ?? `Product #${item.productId}`,
      sku: item.sku ?? "—",
      stock: item.available,
    }));
  } catch {
    // Commerce API unreachable — keep the mock so the dashboard still renders.
    return fallback;
  }
}

export default async function DashboardPage() {
  const [, data] = await Promise.all([
    requirePermission("dashboard.read"),
    mockDashboardRepository.getOverview(),
  ]);
  const lowStock = await getLowStock(data.lowStock);

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <SummaryCards metrics={data.metrics} />
      <DashboardCharts
        revenue={data.revenue}
        orderStatuses={data.orderStatuses}
      />
      <OperationsPanels
        recentOrders={data.recentOrders}
        topProducts={data.topProducts}
        lowStock={lowStock}
      />
    </PageContainer>
  );
}
