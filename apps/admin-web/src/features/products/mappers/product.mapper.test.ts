import { describe, expect, it } from "vitest";
import { mapProductDto } from "./product.mapper";
describe("product mapper", () => {
  it("normalizes a backend DTO", () => {
    const product = mapProductDto({
      product_id: "1",
      product_name: "Rice",
      product_sku: "R-1",
      unit_price: "12.50",
      stock_quantity: 4,
      product_status: "active",
      created_at: "2026-01-01",
      updated_at: "2026-01-02",
    });
    expect(product).toMatchObject({
      id: "1",
      name: "Rice",
      price: 12.5,
      status: "active",
    });
  });
});
