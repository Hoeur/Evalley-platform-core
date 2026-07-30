import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateDependencies } from "../src/dependency-validation.js";
import { PluginRegistry } from "../src/registry.js";
import type { PluginManifest } from "../src/manifest.js";

function manifest(
  id: string,
  dependencies: string[] = [],
  optionalDependencies: string[] = [],
): PluginManifest {
  return { id, name: id, version: "1.0.0", dependencies, optionalDependencies };
}

const platformCore = manifest("platform-core");
const authCore = manifest("auth-core", ["platform-core"]);
const crm = manifest("crm", ["platform-core", "auth-core"], ["ecommerce"]);
const ecommerce = manifest("ecommerce", ["platform-core"]);

describe("validateDependencies", () => {
  it("accepts a set whose required dependencies are all enabled", () => {
    const result = validateDependencies(
      [platformCore, authCore, crm, ecommerce],
      ["platform-core", "auth-core", "crm"],
    );
    assert.equal(result.ok, true);
    assert.deepEqual(result.missingRequired, []);
    // dependencies must appear before dependents
    assert.ok(
      result.loadOrder.indexOf("auth-core") < result.loadOrder.indexOf("crm"),
    );
    assert.ok(
      result.loadOrder.indexOf("platform-core") < result.loadOrder.indexOf("auth-core"),
    );
  });

  it("flags a missing required dependency", () => {
    const result = validateDependencies([platformCore, authCore, crm], ["crm"]);
    assert.equal(result.ok, false);
    assert.deepEqual(result.missingRequired, [
      { pluginId: "crm", missing: ["platform-core", "auth-core"] },
    ]);
  });

  it("treats optional dependencies as non-blocking and reports when wired", () => {
    const without = validateDependencies(
      [platformCore, authCore, crm],
      ["platform-core", "auth-core", "crm"],
    );
    assert.equal(without.ok, true);
    assert.deepEqual(without.optionalWired["crm"], []);

    const withEcom = validateDependencies(
      [platformCore, authCore, crm, ecommerce],
      ["platform-core", "auth-core", "crm", "ecommerce"],
    );
    assert.equal(withEcom.ok, true);
    assert.deepEqual(withEcom.optionalWired["crm"], ["ecommerce"]);
  });

  it("reports unknown enabled plugins", () => {
    const result = validateDependencies([platformCore], ["platform-core", "ghost"]);
    assert.equal(result.ok, false);
    assert.deepEqual(result.unknownPlugins, ["ghost"]);
  });

  it("detects dependency cycles", () => {
    const a = manifest("a", ["b"]);
    const b = manifest("b", ["a"]);
    const result = validateDependencies([a, b], ["a", "b"]);
    assert.equal(result.ok, false);
    assert.equal(result.cycles.length, 1);
  });
});

describe("PluginRegistry", () => {
  it("exposes contributions only for a valid enabled set and hides disabled ones", () => {
    const registry = new PluginRegistry();
    registry.register({
      manifest: {
        ...crm,
        navigation: [{ key: "crm", label: "CRM", href: "/crm", order: 10 }],
        permissions: [{ key: "crm.dashboard.view", description: "View CRM dashboard" }],
      },
    });
    registry.register({ manifest: platformCore });
    registry.register({ manifest: authCore });
    registry.register({
      manifest: {
        ...ecommerce,
        navigation: [{ key: "ecom", label: "Orders", href: "/orders", order: 20 }],
      },
    });

    // ecommerce disabled -> its navigation must not appear
    const resolved = registry.resolveOrThrow(["platform-core", "auth-core", "crm"]);
    assert.deepEqual(
      resolved.navigation.map((n) => n.key),
      ["crm"],
    );
    assert.equal(resolved.permissions.length, 1);
  });

  it("throws when required dependencies are absent", () => {
    const registry = new PluginRegistry();
    registry.register({ manifest: crm });
    assert.throws(() => registry.resolveOrThrow(["crm"]), /requires/);
  });

  it("rejects duplicate registration", () => {
    const registry = new PluginRegistry();
    registry.register({ manifest: platformCore });
    assert.throws(() => registry.register({ manifest: platformCore }), /already registered/);
  });
});
