import { describe, expect, it } from "vitest";
import { parseProductFilters } from "./product.queries";
describe("product URL filters", () => {
  it("applies safe defaults and supported enums", () => {
    expect(
      parseProductFilters({
        page: "-2",
        limit: "25",
        status: "unknown",
        stock: "low-stock",
        q: " rice ",
      }),
    ).toEqual({
      page: 1,
      limit: 25,
      search: "rice",
      status: undefined,
      category: undefined,
      stock: "low-stock",
      sort: "createdAt.desc",
    });
  });
});
