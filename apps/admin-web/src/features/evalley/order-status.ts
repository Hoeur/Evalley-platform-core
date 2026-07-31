/**
 * Shared, framework-free helpers for the orders feature. Safe to import from both
 * server components/actions and client components (no "use client" / "server-only").
 */

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const orderCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

export function orderStatusVariant(status: string): StatusVariant {
  const s = status.toLowerCase();
  if (["completed", "delivered", "fulfilled"].some((x) => s.includes(x))) return "success";
  if (["cancelled", "canceled", "failed"].some((x) => s.includes(x))) return "danger";
  if (s.includes("refund")) return "info";
  return "warning"; // pending / processing / shipped / open
}

export function paymentStatusVariant(status?: string | null): StatusVariant {
  const s = (status ?? "unpaid").toLowerCase();
  if (s.includes("paid") || s.includes("captured")) return "success";
  if (s.includes("refund")) return "info";
  if (s.includes("fail") || s.includes("declined")) return "danger";
  return "warning";
}

/** An order can be cancelled unless it is already in a terminal state. */
export function isCancellable(status: string): boolean {
  const s = status.toLowerCase();
  return !["cancelled", "canceled", "completed", "delivered", "refunded"].includes(s);
}

export function isPaid(paymentStatus?: string | null): boolean {
  const s = (paymentStatus ?? "").toLowerCase();
  return s.includes("paid") || s.includes("captured");
}

/* View models used by the orders list (mapped server-side, rendered client-side). */

export type OrderListItem = {
  readonly id: string;
  readonly number: string;
  readonly customerId: string;
  readonly status: string;
  readonly paymentStatus: string;
  readonly total: number;
  readonly totalLabel: string;
  readonly createdAt: string;
  readonly itemCount: number;
};

export type OrdersMetrics = {
  readonly totalOrders: number;
  readonly processing: number;
  readonly completed: number;
  readonly grossLabel: string;
};

export type OrdersView = {
  readonly orders: readonly OrderListItem[];
  readonly metrics: OrdersMetrics;
};
