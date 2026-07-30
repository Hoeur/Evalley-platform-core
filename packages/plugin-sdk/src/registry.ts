import type { Plugin } from "./plugin.js";
import type {
  PluginManifest,
  NavigationDescriptor,
  PermissionDescriptor,
  RouteDescriptor,
  JobDescriptor,
  WidgetDescriptor,
} from "./manifest.js";
import {
  validateDependencies,
  type DependencyValidationResult,
} from "./dependency-validation.js";

/** Aggregated, permission- and enablement-filtered view of the active platform. */
export interface ResolvedPlatform {
  readonly validation: DependencyValidationResult;
  /** Plugins that are enabled AND valid, in load order. */
  readonly activePlugins: readonly Plugin[];
  readonly navigation: readonly NavigationDescriptor[];
  readonly permissions: readonly PermissionDescriptor[];
  readonly routes: readonly RouteDescriptor[];
  readonly jobs: readonly JobDescriptor[];
  readonly widgets: readonly WidgetDescriptor[];
}

/**
 * In-memory registry of installed plugins. Registration is pure data movement — no plugin
 * code is executed here, and disabled plugins never contribute navigation, routes, jobs
 * or widgets to a resolved platform.
 */
export class PluginRegistry {
  private readonly plugins = new Map<string, Plugin>();

  /** Register a plugin. Throws on duplicate id. */
  register(plugin: Plugin): this {
    const { id } = plugin.manifest;
    if (this.plugins.has(id)) {
      throw new Error(`Plugin "${id}" is already registered.`);
    }
    this.plugins.set(id, plugin);
    return this;
  }

  get(id: string): Plugin | undefined {
    return this.plugins.get(id);
  }

  all(): readonly Plugin[] {
    return [...this.plugins.values()];
  }

  manifests(): readonly PluginManifest[] {
    return this.all().map((p) => p.manifest);
  }

  /** Validate a desired enabled set without resolving contributions. */
  validate(enabled: readonly string[]): DependencyValidationResult {
    return validateDependencies(this.manifests(), enabled);
  }

  /**
   * Resolve the active platform for a desired enabled set. When the set is invalid the
   * result carries the diagnostics and contributes nothing (fail closed).
   */
  resolve(enabled: readonly string[]): ResolvedPlatform {
    const validation = this.validate(enabled);
    if (!validation.ok) {
      return {
        validation,
        activePlugins: [],
        navigation: [],
        permissions: [],
        routes: [],
        jobs: [],
        widgets: [],
      };
    }

    const activePlugins = validation.loadOrder.map((id) => this.plugins.get(id)!);

    const navigation = activePlugins
      .flatMap((p) => p.manifest.navigation ?? [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const permissions = dedupeBy(
      activePlugins.flatMap((p) => p.manifest.permissions ?? []),
      (perm) => perm.key,
    );
    const routes = activePlugins.flatMap((p) => p.manifest.routes ?? []);
    const jobs = activePlugins.flatMap((p) => p.manifest.jobs ?? []);
    const widgets = activePlugins.flatMap((p) => p.manifest.widgets ?? []);

    return { validation, activePlugins, navigation, permissions, routes, jobs, widgets };
  }

  /** Resolve, throwing a descriptive error when the enabled set is invalid. */
  resolveOrThrow(enabled: readonly string[]): ResolvedPlatform {
    const resolved = this.resolve(enabled);
    if (!resolved.validation.ok) {
      throw new Error(describeValidation(resolved.validation));
    }
    return resolved;
  }
}

function dedupeBy<T>(items: readonly T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

function describeValidation(result: DependencyValidationResult): string {
  const parts: string[] = [];
  if (result.unknownPlugins.length > 0) {
    parts.push(`unknown plugins: ${result.unknownPlugins.join(", ")}`);
  }
  for (const issue of result.missingRequired) {
    parts.push(`"${issue.pluginId}" requires: ${issue.missing.join(", ")}`);
  }
  for (const cycle of result.cycles) {
    parts.push(`dependency cycle: ${cycle.join(" -> ")}`);
  }
  return `Invalid plugin configuration — ${parts.join("; ")}`;
}
