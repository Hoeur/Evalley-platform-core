import type { PluginManifest } from "./manifest.js";
import type { PluginContext, PluginLifecycle } from "./lifecycle.js";

/**
 * A plugin bundles its declarative {@link PluginManifest} with optional lifecycle hooks
 * and an imperative `register()` where it binds route/event/job handlers to the ids
 * declared in the manifest.
 *
 * `register()` runs only for enabled plugins whose dependencies are satisfied.
 */
export interface Plugin {
  readonly manifest: PluginManifest;
  readonly lifecycle?: PluginLifecycle;
  register?(ctx: PluginContext): void;
}

/** Identity helper that preserves the concrete manifest type. */
export function definePlugin(plugin: Plugin): Plugin {
  return plugin;
}
