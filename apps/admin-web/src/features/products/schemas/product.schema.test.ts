import { describe, expect, it } from "vitest";
import { productSchema } from "./product.schema";
describe("product form validation", () => {
  it("rejects invalid commercial values", () => {
    const result = productSchema.safeParse({
      name: "x",
      sku: "",
      price: -1,
      stock: -2,
      status: "active",
    });
    expect(result.success).toBe(false);
  });
});
