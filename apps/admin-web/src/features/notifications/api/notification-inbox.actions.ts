"use server";

import { getSession } from "@/core/auth/session.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { normalizeError } from "@/core/http/normalize-error";
import type { InboxSnapshot } from "../notification-utils";

const EMPTY: InboxSnapshot = { unreadCount: 0, notifications: [] };

/**
 * Powers the header bell. Every admin has an inbox with only their own
 * notifications, so this needs no permission flag — just a live session.
 * Polled on an interval, so it must never throw: an expired session or a
 * transient API error resolves to an empty inbox rather than a crash.
 */
export async function fetchAdminInboxAction(): Promise<InboxSnapshot> {
  try {
    const session = await getSession();
    if (!session) return EMPTY;
    const core = getEcommerceCore();
    const [page, unreadCount] = await Promise.all([
      core.notifications.listInbox({ perPage: 8 }),
      core.notifications.unreadCount(),
    ]);
    return { unreadCount, notifications: page.items };
  } catch {
    return EMPTY;
  }
}

export async function markNotificationReadAction(id: string) {
  try {
    await getEcommerceCore().notifications.markRead(id);
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}

export async function markAllNotificationsReadAction() {
  try {
    const marked = await getEcommerceCore().notifications.markAllRead();
    return { ok: true as const, marked };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}

export async function deleteNotificationAction(id: string) {
  try {
    await getEcommerceCore().notifications.delete(id);
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}
