# @platform/plugin-sdk

Reusable contracts for platform modules. A module (E-commerce, Rental, Booking, CRM…)
ships a **manifest** (pure data) plus optional **lifecycle hooks** and an imperative
`register()` that binds handlers. The host uses this SDK to validate, order and activate
modules — without executing any plugin code during discovery.

## What it provides

- `PluginManifest` and registration descriptors — permissions, routes, navigation,
  events, migrations, jobs, widgets, settings, feature flags.
- `PluginLifecycle` — `onInstall` / `onEnable` / `onDisable` / `onUninstall` /
  `onApplicationStart` / `onApplicationStop`.
- `PluginContext` — the only surface a plugin uses to reach the host (events, logging,
  handler binding, optional-module detection).
- `validateDependencies()` — required vs. optional dependency checking, unknown-plugin
  detection, cycle detection, and a topological load order. Pure and unit-tested.
- `PluginRegistry` — registers plugins and resolves a **fail-closed** active view:
  disabled plugins contribute no navigation, routes, jobs or widgets.
- `resolveFeatureFlags()` — manifest defaults overridden per client.

## Design rules

- **No dynamic code execution.** Modules are plain imported objects; the manifest is
  serializable and never `eval`'d.
- **Fail closed.** An invalid enabled set contributes nothing and surfaces diagnostics.
- **Deterministic order.** Load order is a stable topological sort of enabled plugins.

## Example

```ts
import { PluginRegistry } from "@platform/plugin-sdk";
import { crmPlugin } from "@platform/crm-core";

const registry = new PluginRegistry()
  .register(platformCorePlugin)
  .register(authCorePlugin)
  .register(crmPlugin);

const platform = registry.resolveOrThrow(["platform-core", "auth-core", "crm"]);
// platform.navigation / .permissions / .routes contain only enabled modules
```
