import type {
  AdminNotification,
  BroadcastTargetType,
  CustomerGroupSummary,
  NotificationBroadcast,
  NotificationChannel,
} from "@platform/ecommerce-core";

/** Client-safe helpers + view models for the notifications admin screens. */

export type BroadcastCustomerOption = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
};

export type BroadcastsView = {
  readonly broadcasts: readonly NotificationBroadcast[];
  readonly total: number;
  readonly groups: readonly CustomerGroupSummary[];
  readonly customers: readonly BroadcastCustomerOption[];
};

export const NOTIFICATION_CHANNELS: {
  value: NotificationChannel;
  label: string;
  hint?: string;
}[] = [
  { value: "in_app", label: "In-app", hint: "Always included" },
  { value: "mail", label: "Email" },
  { value: "telegram", label: "Telegram" },
  { value: "fcm", label: "Push" },
];

export function channelLabel(channel: NotificationChannel): string {
  return (
    NOTIFICATION_CHANNELS.find((c) => c.value === channel)?.label ?? channel
  );
}

export function targetLabel(target: BroadcastTargetType): string {
  switch (target) {
    case "all":
      return "All customers";
    case "customers":
      return "Selected customers";
    case "groups":
      return "Customer groups";
    default:
      return target;
  }
}

const TYPE_LABELS: Record<string, string> = {
  "order.placed": "Order placed",
  "order.status_changed": "Order updated",
  "order.paid": "Order paid",
  "order.cancelled": "Order cancelled",
  "order.refunded": "Order refunded",
  "review.approved": "Review approved",
  "review.rejected": "Review rejected",
  "stock.low": "Low stock",
  "stock.out": "Out of stock",
  "admin.broadcast": "Announcement",
};

export function notificationTypeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

export function notificationTone(
  type: string,
): "success" | "warning" | "danger" | "info" | "neutral" {
  if (type.startsWith("order.refunded") || type === "order.cancelled")
    return "danger";
  if (type === "stock.out" || type === "review.rejected") return "danger";
  if (type === "stock.low") return "warning";
  if (type === "order.paid" || type === "review.approved") return "success";
  if (type === "admin.broadcast") return "info";
  return "neutral";
}

/** A lightweight relative-time formatter (no external dependency). */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const abs = Math.abs(diff);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (abs < minute) return "just now";
  if (abs < hour) return `${Math.round(abs / minute)}m ago`;
  if (abs < day) return `${Math.round(abs / hour)}h ago`;
  if (abs < 7 * day) return `${Math.round(abs / day)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function broadcastDeepLink(
  data: Readonly<Record<string, unknown>>,
): string | null {
  const url = data?.url;
  return typeof url === "string" && url ? url : null;
}

export function isUnread(notification: AdminNotification): boolean {
  return !notification.isRead;
}

export type InboxSnapshot = {
  readonly unreadCount: number;
  readonly notifications: readonly AdminNotification[];
};
