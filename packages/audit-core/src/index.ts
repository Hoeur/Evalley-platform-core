import type { PluginManifest } from "@platform/plugin-sdk";

/**
 * Audit log host that records module audit entries.
 *
 * Stub package (Phase 1). Only the manifest is defined so the plugin registry can validate
 * dependencies and ordering against a real node. Implementation lands in a later phase.
 */
export const auditCoreManifest: PluginManifest = {
  id: "audit-core",
  name: "Audit Core",
  version: "0.1.0",
  description: "Audit log host that records module audit entries.",
  dependencies: ["platform-core"],
};
