import { describe, expect, it, vi } from "vitest";
import {
  createLaravelEcommerceCore,
  ecommerceModuleCapabilities,
  type EcommerceRequest,
  type EcommerceTransport,
  type LaravelEnvelope,
} from "@platform/ecommerce-core";

function itemEnvelope<T>(item: T): LaravelEnvelope<T> {
  return {
    status: 200,
    status_description: "OK",
    error_code: "",
    error_message: "",
    error_fields: {},
    data: { item, items: null, meta: null },
  };
}

function listEnvelope<T>(items: readonly T[]): LaravelEnvelope<T> {
  return {
    status: 200,
    status_description: "OK",
    error_code: "",
    error_message: "",
    error_fields: {},
    data: {
      item: null,
      items,
      meta: { current_page: 1, per_page: 20, total: items.length, last_page: 1 },
    },
  };
}

describe("@platform/ecommerce-core notifications", () => {
  it("maps the admin inbox and reads the unread counter off data.item", async () => {
    const transport = vi.fn(async (request: EcommerceRequest) => {
      if (request.path === "/notifications/unread-count") {
        return itemEnvelope({ unread_count: 3 });
      }
      return listEnvelope([
        {
          id: 7,
          type: "admin.broadcast",
          title: "Sale",
          body: "40% off",
          data: { url: "https://shop/x" },
          is_read: false,
          read_at: null,
          created_at: "2026-08-04T00:00:00Z",
        },
      ]);
    }) as EcommerceTransport;
    const core = createLaravelEcommerceCore({ transport });

    const page = await core.notifications.listInbox({
      perPage: 8,
      unreadOnly: true,
    });
    expect(page.items[0]).toMatchObject({
      id: "7",
      type: "admin.broadcast",
      isRead: false,
    });
    expect(await core.notifications.unreadCount()).toBe(3);
  });

  it("scopes ids to the target type and coerces them to integers", async () => {
    let captured: EcommerceRequest | undefined;
    const transport = vi.fn(async (request: EcommerceRequest) => {
      captured = request;
      return itemEnvelope({
        id: 1,
        title: "t",
        body: "b",
        data: {},
        channels: ["in_app", "fcm"],
        target_type: "groups",
        target_ids: [2, 3],
        recipients_count: 50,
        sent_by: { id: 9, name: "Admin" },
        sent_at: null,
        created_at: "2026-08-04T00:00:00Z",
      });
    }) as EcommerceTransport;
    const core = createLaravelEcommerceCore({ transport });

    const broadcast = await core.notifications.sendBroadcast({
      title: "t",
      body: "b",
      targetType: "groups",
      groupIds: ["2", "3"],
      customerIds: ["9"],
      channels: ["in_app", "fcm"],
      data: { url: "u" },
    });

    expect(captured).toMatchObject({
      method: "POST",
      path: "/notification-broadcasts",
      body: {
        target_type: "groups",
        group_ids: [2, 3],
        customer_ids: undefined,
        channels: ["in_app", "fcm"],
        data: { url: "u" },
      },
    });
    expect(broadcast).toMatchObject({
      id: "1",
      targetType: "groups",
      targetIds: ["2", "3"],
      recipientsCount: 50,
      deliveredCount: null,
      sentBy: { id: "9", name: "Admin" },
    });
  });

  it("marks notifications as an available module", () => {
    expect(ecommerceModuleCapabilities.notifications.status).toBe("available");
  });
});
