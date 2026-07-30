import { describe, expect, it } from "vitest";
import { hasPermission } from "./permissions";
describe("permissions", () => { it("allows owned permissions and rejects missing ones", () => { expect(hasPermission(["products.read"], "products.read")).toBe(true); expect(hasPermission(["products.read"], "products.delete")).toBe(false); }); });
