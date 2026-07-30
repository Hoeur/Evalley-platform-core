import type { DashboardData } from "@/features/dashboard/types/dashboard.types";

export const dashboardMock: DashboardData = {
  metrics: [
    { label: "Total revenue", value: "$284,540", change: "+12.8%", trend: "up" },
    { label: "Orders", value: "3,842", change: "+6.2%", trend: "up" },
    { label: "New customers", value: "1,204", change: "+9.1%", trend: "up" },
    { label: "Refund rate", value: "2.4%", change: "−0.6%", trend: "down" },
  ],
  revenue: [
    { month: "Jul", revenue: 42000, orders: 520 }, { month: "Aug", revenue: 55000, orders: 640 },
    { month: "Sep", revenue: 49000, orders: 610 }, { month: "Oct", revenue: 63000, orders: 730 },
    { month: "Nov", revenue: 57000, orders: 690 }, { month: "Dec", revenue: 74000, orders: 820 },
    { month: "Jan", revenue: 68000, orders: 780 }, { month: "Feb", revenue: 83000, orders: 910 },
    { month: "Mar", revenue: 78000, orders: 860 }, { month: "Apr", revenue: 92000, orders: 1040 },
    { month: "May", revenue: 88000, orders: 980 }, { month: "Jun", revenue: 104000, orders: 1140 },
  ],
  orderStatuses: [{ name: "Completed", value: 46 }, { name: "Processing", value: 25 }, { name: "Pending", value: 17 }, { name: "Canceled", value: 12 }],
  recentOrders: [
    { id: "MF-24815", customer: "Emma Rodriguez", total: 149, paymentStatus: "Paid", status: "Completed" },
    { id: "MF-24814", customer: "Liam Chen", total: 89.5, paymentStatus: "Pending", status: "Processing" },
    { id: "MF-24813", customer: "Olivia Martins", total: 312.2, paymentStatus: "Paid", status: "Shipped" },
    { id: "MF-24812", customer: "Noah Williams", total: 54, paymentStatus: "Failed", status: "Canceled" },
    { id: "MF-24811", customer: "Ava Petrov", total: 228.75, paymentStatus: "Paid", status: "Completed" },
    { id: "MF-24810", customer: "Mason Cole", total: 167.3, paymentStatus: "Paid", status: "Processing" },
  ],
  topProducts: [
    { id: "p1", name: "Herschel Little America Backpack", sales: 412, revenue: 18540, color: "#f5d0b0" },
    { id: "p2", name: "Sony WH-1000XM5 Headphones", sales: 388, revenue: 97000, color: "#c9d6ea" },
    { id: "p3", name: "Apple Watch Series 9 GPS", sales: 356, revenue: 142400, color: "#d8cdea" },
    { id: "p4", name: "Nike Air Zoom Pegasus 41", sales: 301, revenue: 36120, color: "#cfe6d6" },
  ],
  lowStock: [
    { id: "p-1", name: "Canon EOS R6 Mark II", sku: "CAN-R6", stock: 3 },
    { id: "p-2", name: "Logitech MX Master 3S", sku: "LOG-MX3", stock: 6 },
    { id: "p-3", name: "Dyson V15 Detect", sku: "DYS-V15", stock: 4 },
  ],
};
