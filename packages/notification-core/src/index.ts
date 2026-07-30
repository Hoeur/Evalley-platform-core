import type { PluginManifest } from "@platform/plugin-sdk";

/**
 * Notification dispatch host (in-app/email/sms/...), provider-agnostic.
 *
 * Stub package (Phase 1). Only the manifest is defined so the plugin registry can validate
 * dependencies and ordering against a real node. Implementation lands in a later phase.
 */
export const notificationCoreManifest: PluginManifest = {
  id: "notification-core",
  name: "Notification Core",
  version: "0.1.0",
  description: "Notification dispatch host (in-app/email/sms/...), provider-agnostic.",
  dependencies: ["platform-core"],
};
