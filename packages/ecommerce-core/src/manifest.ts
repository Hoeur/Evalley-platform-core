import type { PluginManifest } from "@platform/plugin-sdk";

export const ecommerceCoreManifest: PluginManifest = {
  id: "ecommerce-core",
  name: "E-commerce Core",
  version: "0.2.0",
  description:
    "Commerce contracts and adapters for catalog, inventory, orders, refunds, and reviews.",
  dependencies: ["platform-core"],
};
