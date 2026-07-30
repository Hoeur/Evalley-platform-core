export type DashboardMetric = { label: string; value: string; change: string; trend: "up" | "down" };
export type RevenuePoint = { month: string; revenue: number; orders: number };
export type RecentOrder = { id: string; customer: string; total: number; paymentStatus: "Paid" | "Pending" | "Failed" | "Refunded"; status: "Completed" | "Processing" | "Shipped" | "Canceled" };
export type LowStockProduct = { id: string; name: string; sku: string; stock: number };
export type TopProduct = { id: string; name: string; sales: number; revenue: number; color: string };
export type DashboardData = { metrics: DashboardMetric[]; revenue: RevenuePoint[]; orderStatuses: { name: string; value: number }[]; recentOrders: RecentOrder[]; topProducts: TopProduct[]; lowStock: LowStockProduct[] };
