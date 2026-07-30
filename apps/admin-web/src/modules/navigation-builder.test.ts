import { describe, expect, it } from "vitest";
import { buildNavigation } from "./navigation-builder";
describe("navigation builder", () => {
  it("intersects modules and permissions", () => {
    const groups = buildNavigation(["dashboard", "products", "orders"], ["dashboard.read", "products.read"]);
    expect(groups.flatMap((group) => group.items).map((item) => item.key)).toEqual(["dashboard", "products"]);
  });

  it("builds distinct grocery and rental navigation", () => {
    const grocery = buildNavigation(
      ["dashboard", "products", "promotions", "shipping"],
      ["dashboard.read", "products.read", "promotions.read", "shipping.read"],
    );
    const rental = buildNavigation(
      ["dashboard", "properties", "tenants", "leases"],
      ["dashboard.read", "properties.read", "tenants.read", "leases.read"],
    );

    expect(grocery.flatMap((group) => group.items).map((item) => item.key)).toEqual([
      "dashboard",
      "products",
      "promotions",
      "shipping",
    ]);
    expect(rental.flatMap((group) => group.items).map((item) => item.key)).toEqual([
      "dashboard",
      "properties",
      "tenants",
      "leases",
    ]);
  });

  it("builds the complete Evalley operations navigation", () => {
    const enabled = ["dashboard", "analytics", "products", "variants", "attributes", "inventory", "categories", "promotions", "reviews", "orders", "returns", "shipments", "customers", "vendors", "withdrawals", "ledger", "modules", "settings"] as const;
    const permissions = ["dashboard.read", "analytics.read", "products.read", "variants.read", "attributes.read", "inventory.read", "categories.read", "promotions.read", "reviews.read", "orders.read", "returns.read", "shipments.read", "customers.read", "vendors.read", "withdrawals.read", "ledger.read", "modules.manage", "settings.read"] as const;
    const keys = buildNavigation([...enabled], [...permissions]).flatMap((group) => group.items).map((item) => item.key);
    expect(keys).toEqual(enabled);
  });
});
