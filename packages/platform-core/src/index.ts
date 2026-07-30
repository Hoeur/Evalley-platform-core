import type { PluginManifest } from "@platform/plugin-sdk";

/**
 * Host runtime: configuration, event bus, tenant resolution and the module host.
 *
 * Stub package (Phase 1). Only the manifest is defined so the plugin registry can validate
 * dependencies and ordering against a real node. Implementation lands in a later phase.
 */
export const platformCoreManifest: PluginManifest = {
  id: "platform-core",
  name: "Platform Core",
  version: "0.1.0",
  description: "Host runtime: configuration, event bus, tenant resolution and the module host.",
  dependencies: [],
};
