import type { PluginManifest } from "@platform/plugin-sdk";

/**
 * Shared design system (shadcn/ui primitives + tokens) consumed by every app.
 *
 * Stub package (Phase 1). Only the manifest is defined so the plugin registry can validate
 * dependencies and ordering against a real node. Implementation lands in a later phase.
 */
export const uiCoreManifest: PluginManifest = {
  id: "ui-core",
  name: "UI Core",
  version: "0.1.0",
  description: "Shared design system (shadcn/ui primitives + tokens) consumed by every app.",
  dependencies: ["platform-core"],
};
