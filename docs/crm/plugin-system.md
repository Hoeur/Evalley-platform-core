# Plugin System (`@platform/plugin-sdk`)

**Audience:** anyone building or wiring a platform module. This is the mechanism CRM (and
every other add-on) uses to plug into the host.

## Model

A module is three things:

1. a **manifest** — pure, serializable data describing what it contributes;
2. optional **lifecycle hooks** — where side effects run;
3. an imperative **`register(ctx)`** — where it binds handlers to manifest-declared ids.

The host discovers modules by reading manifests. **No plugin code runs during discovery**,
and there is no dynamic `eval`/runtime import — modules are plain imported objects.

```ts
import { definePlugin } from "@platform/plugin-sdk";

export const crmPlugin = definePlugin({
  manifest: crmManifest,
  lifecycle: { async onEnable(ctx) { /* ... */ } },
  register(ctx) {
    if (ctx.hasModule("ecommerce-core")) {
      // ctx.bindEventHandler(...) — only when the optional module is present
    }
  },
});
```

## Manifest

```ts
interface PluginManifest {
  id: string;
  name: string;
  version: string;
  dependencies: string[];           // MUST be enabled
  optionalDependencies?: string[];  // wired only if present; never required
  permissions?: PermissionDescriptor[];
  routes?: RouteDescriptor[];        // versioned path + required permission
  navigation?: NavigationDescriptor[];
  events?: EventSubscriptionDescriptor[];
  migrations?: MigrationDescriptor[];
  jobs?: JobDescriptor[];
  widgets?: WidgetDescriptor[];
  settings?: SettingDescriptor[];
  featureFlags?: FeatureFlagDescriptor[];
}
```

Descriptors are **data**. Handlers (routes, events, jobs) are bound later in `register()`
by their declared id, which keeps the manifest inspectable and diffable.

## Enabling modules

Modules are enabled through configuration:

```ts
export const enabledPlugins = ["crm", "ecommerce", "booking"];
```

or the environment:

```env
ENABLED_PLUGINS=crm,ecommerce,booking
```

## Dependency validation

`validateDependencies(manifests, enabled)` is pure and returns:

- `ok` — the set is consistent and loadable;
- `loadOrder` — enabled plugins in dependency-first order (topological sort);
- `missingRequired` — enabled plugins whose required deps aren't all enabled;
- `unknownPlugins` — enabled ids that aren't registered;
- `cycles` — dependency cycles among enabled plugins;
- `optionalWired` — optional deps that are present and enabled, per plugin.

`PluginRegistry.resolve(enabled)` runs this and, on success, returns the aggregated
navigation, permissions, routes, jobs and widgets **for enabled plugins only**. On failure
it **fails closed** (contributes nothing); `resolveOrThrow` raises a descriptive error.

```ts
const registry = new PluginRegistry()
  .register(platformCorePlugin)
  .register(authCorePlugin)
  .register(crmPlugin);

const platform = registry.resolveOrThrow(["platform-core", "auth-core", "crm"]);
platform.navigation; // only enabled modules' nav, sorted by order
```

### Guarantees (unit-tested)

- A **disabled** module contributes no navigation, routes, jobs or widgets.
- A **missing required dependency**, **unknown plugin**, or **cycle** blocks activation.
- **Optional dependencies never block** — CRM is valid with `platform-core` + `auth-core`
  alone, and lights up integrations only when the optional module is enabled.
- Load order always places dependencies before dependents.

## Lifecycle hooks

```text
onInstall        → run migrations, create default settings
onEnable         → register cron/jobs, warm caches
onDisable        → tear down jobs; data is retained
onUninstall      → remove data only on explicit, confirmed request
onApplicationStart / onApplicationStop → process-level warm-up / cleanup
```

## Adding a new module

1. Create `packages/<name>-core` with a `src/manifest.ts` exporting a `PluginManifest`
   (`id`, `dependencies`, contributions).
2. Export a `plugin` via `definePlugin({ manifest, lifecycle, register })`.
3. Register it with the host `PluginRegistry` and add its id to the enabled config.
4. Keep the public surface in `src/index.ts`; never import another module's internals —
   integrate through `@platform/shared` contracts and events.

## Why this design

- **No dynamic code execution** — manifests are data; the host validates before anything
  runs. Safer and inspectable.
- **Fail closed** — an inconsistent configuration never half-activates.
- **Deterministic** — load order is a stable topological sort, so start-up is reproducible.
