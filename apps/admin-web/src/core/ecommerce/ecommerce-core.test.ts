import { describe, expect, it, vi } from "vitest";
import {
  createLaravelEcommerceCore,
  ecommerceModuleCapabilities,
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
      meta: {
        current_page: 1,
        per_page: 20,
        total: items.length,
        last_page: 1,
      },
    },
  };
}

const productDto = {
  id: 41,
  brand_id: null,
  parent_id: null,
  sku: "MOUSE-41",
  barcode: null,
  slug: "wireless-mouse",
  status: "published" as const,
  is_featured: false,
  is_variation: false,
  is_configurable: false,
  price: "29.99",
  sale_price: null,
  currency: "USD",
  category_ids: [3],
  thumbnail: null,
  translations: {
    en: { name: "Wireless Mouse", description: "Ergonomic mouse" },
  },
  attributes: [],
  created_at: "2026-07-29T00:00:00Z",
  updated_at: "2026-07-29T00:00:00Z",
};

describe("@platform/ecommerce-core Laravel adapter", () => {
  it("normalizes the Laravel envelope and product DTO", async () => {
    const transport = vi.fn(async () => listEnvelope([productDto])) as EcommerceTransport;
    const core = createLaravelEcommerceCore({ transport, locale: "en" });

    const page = await core.catalog.listProducts({
      page: 1,
      perPage: 20,
      status: "published",
    });

    expect(transport).toHaveBeenCalledWith({
      method: "GET",
      path: "/catalog/products",
      query: {
        page: 1,
        per_page: 20,
        q: undefined,
        status: "published",
        brand_id: undefined,
        category_id: undefined,
        is_featured: undefined,
      },
    });
    expect(page.items[0]).toMatchObject({
      id: "41",
      name: "Wireless Mouse",
      status: "published",
      price: 29.99,
      categoryIds: ["3"],
    });
  });

  it("maps admin review moderation to the API endpoint", async () => {
    const transport = vi.fn(async () =>
      itemEnvelope({
        id: 5,
        customer_id: 9,
        customer_name: "Customer",
        product_id: 41,
        rating: 5,
        title: null,
        body: "Excellent",
        status: "approved",
        created_at: "2026-07-29T00:00:00Z",
        updated_at: "2026-07-29T00:00:00Z",
      }),
    ) as EcommerceTransport;
    const core = createLaravelEcommerceCore({ transport });

    const review = await core.reviews.approve("5");

    expect(transport).toHaveBeenCalledWith({
      method: "POST",
      path: "/reviews/5/approve",
    });
    expect(review.status).toBe("approved");
  });

  it("marks modules without backend endpoints as backend-required", () => {
    expect(ecommerceModuleCapabilities.products.status).toBe("available");
    expect(ecommerceModuleCapabilities.promotions.status).toBe("backend-required");
    expect(ecommerceModuleCapabilities.customers.status).toBe("backend-required");
  });
});
