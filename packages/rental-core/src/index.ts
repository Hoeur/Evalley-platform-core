import type { PluginManifest } from "@platform/plugin-sdk";

/**
 * Rental module — an optional integration source for CRM.
 *
 * Stub package (Phase 1). Only the manifest is defined so the plugin registry can validate
 * dependencies and ordering against a real node. Implementation lands in a later phase.
 */
export const rentalCoreManifest: PluginManifest = {
  id: "rental-core",
  name: "Rental Core",
  version: "0.1.0",
  description: "Rental module — an optional integration source for CRM.",
  dependencies: ["platform-core"],
};
