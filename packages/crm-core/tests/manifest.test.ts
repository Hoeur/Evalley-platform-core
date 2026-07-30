import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PluginRegistry } from "@platform/plugin-sdk";
import { crmManifest } from "../src/manifest.js";
import { crmPlugin } from "../src/plugin.js";
import { crmPermissions } from "../src/permissions/index.js";
import { crmRoutes } from "../src/api/routes/index.js";

describe("crm manifest", () => {
  it("declares the expected required and optional dependencies", () => {
    assert.deepEqual([...crmManifest.dependencies], ["platform-core", "auth-core"]);
    assert.ok(crmManifest.optionalDependencies?.includes("ecommerce-core"));
    assert.ok(crmManifest.optionalDependencies?.includes("booking-core"));
  });

  it("has unique permission keys", () => {
    const keys = crmPermissions.map((permission) => permission.key);
    assert.equal(new Set(keys).size, keys.length);
  });

  it("only references permissions it declares in its routes", () => {
    const declared = new Set(crmPermissions.map((permission) => permission.key));
    for (const route of crmRoutes) {
      if (route.permission) {
        assert.ok(
          declared.has(route.permission),
          `route ${route.id} references undeclared permission ${route.permission}`,
        );
      }
    }
  });
});

describe("crm plugin registration", () => {
  const platformCore = { id: "platform-core", name: "platform-core", version: "1.0.0", dependencies: [] };
  const authCore = { id: "auth-core", name: "auth-core", version: "1.0.0", dependencies: ["platform-core"] };

  it("resolves and contributes navigation when dependencies are enabled", () => {
    const registry = new PluginRegistry()
      .register({ manifest: platformCore })
      .register({ manifest: authCore })
      .register(crmPlugin);

    const platform = registry.resolveOrThrow(["platform-core", "auth-core", "crm"]);
    assert.ok(platform.navigation.some((item) => item.key === "crm"));
    assert.ok(platform.permissions.some((p) => p.key === "crm.dashboard.view"));
  });

  it("runs standalone: valid without any optional module", () => {
    const registry = new PluginRegistry()
      .register({ manifest: platformCore })
      .register({ manifest: authCore })
      .register(crmPlugin);

    const validation = registry.validate(["platform-core", "auth-core", "crm"]);
    assert.equal(validation.ok, true);
    assert.deepEqual(validation.optionalWired["crm"], []);
  });

  it("fails closed when a required dependency is missing", () => {
    const registry = new PluginRegistry().register(crmPlugin);
    assert.throws(() => registry.resolveOrThrow(["crm"]), /requires/);
  });
});
