import { describe, expect, it } from "vitest";
import type { ModuleKey } from "@/clients/client.types";
import { collectDependencies, findEnabledDependents } from "./module-catalog";

const commerceModules: ModuleKey[] = [
  "dashboard",
  "products",
  "customers",
  "promotions",
  "orders",
  "returns",
];

describe("module catalog", () => {
  it("collects all licensed dependencies when enabling an add-on", () => {
    expect(collectDependencies("promotions", commerceModules)).toEqual(["products", "customers"]);
  });

  it("identifies modules that prevent disabling a dependency", () => {
    expect(findEnabledDependents("orders", commerceModules)).toEqual(["returns"]);
  });

  it("never adds a dependency outside the client license", () => {
    expect(collectDependencies("promotions", ["promotions", "products"])).toEqual(["products"]);
  });
});
