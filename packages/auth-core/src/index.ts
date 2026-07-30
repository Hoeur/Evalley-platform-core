import type { PluginManifest } from "@platform/plugin-sdk";

/**
 * Identity, sessions and server-side RBAC enforcement for the platform.
 *
 * Stub package (Phase 1). Only the manifest is defined so the plugin registry can validate
 * dependencies and ordering against a real node. Implementation lands in a later phase.
 */
export const authCoreManifest: PluginManifest = {
  id: "auth-core",
  name: "Auth Core",
  version: "0.1.0",
  description: "Identity, sessions and server-side RBAC enforcement for the platform.",
  dependencies: ["platform-core"],
};
