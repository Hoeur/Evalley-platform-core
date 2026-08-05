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

  it("normalizes admin media objects (and plain URLs) to URL strings", async () => {
    // The authenticated admin product resource returns images as media objects
    // (id + url), unlike the public resource's bare URL strings. Passing an
    // object into an <img src> renders "[object Object]", so the mapper must
    // extract the URL from either shape.
    const transport = vi.fn(async () =>
      itemEnvelope({
        ...productDto,
        thumbnail: { id: 1, url: "https://cdn.example/thumb.jpg" },
        images: [
          "https://cdn.example/plain.jpg",
          { id: 2, url: "https://cdn.example/a.jpg" },
          { id: 3, original_url: "https://cdn.example/b.jpg" },
        ],
      }),
    ) as EcommerceTransport;
    const core = createLaravelEcommerceCore({ transport, locale: "en" });

    const product = await core.catalog.getProduct("41");

    expect(product.thumbnailUrl).toBe("https://cdn.example/thumb.jpg");
    expect(product.imageUrls).toEqual([
      "https://cdn.example/plain.jpg",
      "https://cdn.example/a.jpg",
      "https://cdn.example/b.jpg",
    ]);
  });

  it("uploads a product image as a named image file so Laravel's `image` rule passes", async () => {
    // Worst case: a server action forwards a nameless, typeless Blob. Appended
    // as-is, undici sends filename="blob" + application/octet-stream, which
    // Laravel rejects as "The image field must be an image." uploadBody must
    // pin a real image filename + content-type.
    let captured: { method: string; path: string; body: FormData } | undefined;
    const transport = vi.fn(async (request) => {
      captured = request as unknown as typeof captured;
      return itemEnvelope(productDto);
    }) as unknown as EcommerceTransport;
    const core = createLaravelEcommerceCore({ transport, locale: "en" });

    const blob = new Blob([new Uint8Array([1, 2, 3, 4])]);
    await core.catalog.uploadProductImage("41", blob as unknown as File);

    expect(captured?.method).toBe("POST");
    expect(captured?.path).toBe("/catalog/products/41/images");
    const part = captured?.body.get("image") as File;
    expect(part).toBeInstanceOf(File);
    expect(part.name).toMatch(/\.(jpg|jpeg|png|webp|gif|svg)$/);
    expect(part.type).toMatch(/^image\//);
  });

  it("preserves an original image filename on upload", async () => {
    let captured: { body: FormData } | undefined;
    const transport = vi.fn(async (request) => {
      captured = request as unknown as typeof captured;
      return itemEnvelope(productDto);
    }) as unknown as EcommerceTransport;
    const core = createLaravelEcommerceCore({ transport, locale: "en" });

    const file = new File([new Uint8Array([1, 2, 3])], "photo.png", {
      type: "image/png",
    });
    await core.catalog.uploadProductImage("41", file);

    const part = captured?.body.get("image") as File;
    expect(part.name).toBe("photo.png");
    expect(part.type).toBe("image/png");
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
    expect(ecommerceModuleCapabilities.vendors.status).toBe("available");
    expect(ecommerceModuleCapabilities.withdrawals.status).toBe("available");
    expect(ecommerceModuleCapabilities.ledger.status).toBe("available");
    expect(ecommerceModuleCapabilities.returns.status).toBe("backend-required");
    expect(ecommerceModuleCapabilities.marketing.status).toBe("backend-required");
  });
});
