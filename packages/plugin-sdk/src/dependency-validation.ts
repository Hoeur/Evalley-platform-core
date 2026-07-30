import type { PluginManifest } from "./manifest.js";

/** A plugin that is missing one or more required dependencies. */
export interface DependencyIssue {
  readonly pluginId: string;
  readonly missing: readonly string[];
}

export interface DependencyValidationResult {
  /** True when the enabled set is internally consistent and loadable. */
  readonly ok: boolean;
  /** Enabled plugins in dependency-safe initialization order. */
  readonly loadOrder: readonly string[];
  /** Enabled plugins whose required dependencies are not all enabled. */
  readonly missingRequired: readonly DependencyIssue[];
  /** Enabled ids that are not registered. */
  readonly unknownPlugins: readonly string[];
  /** Dependency cycles among enabled plugins (each a list of ids in the cycle). */
  readonly cycles: readonly (readonly string[])[];
  /** Optional dependencies that ARE present and enabled, per plugin. */
  readonly optionalWired: Readonly<Record<string, readonly string[]>>;
}

/**
 * Validate a desired set of enabled plugins against the registered manifests.
 *
 * Rules:
 * - every required dependency must be registered AND enabled;
 * - optional dependencies are wired only when present and enabled (never required);
 * - the enabled dependency graph must be acyclic;
 * - a valid set yields a topological load order (dependencies first).
 *
 * Pure and side-effect free so it is trivially testable.
 */
export function validateDependencies(
  manifests: readonly PluginManifest[],
  enabled: readonly string[],
): DependencyValidationResult {
  const registered = new Map(manifests.map((m) => [m.id, m]));
  const enabledSet = new Set(enabled);

  const unknownPlugins = enabled.filter((id) => !registered.has(id));
  const enabledManifests = enabled
    .filter((id) => registered.has(id))
    .map((id) => registered.get(id)!);

  const missingRequired: DependencyIssue[] = [];
  const optionalWired: Record<string, string[]> = {};

  for (const manifest of enabledManifests) {
    const missing = manifest.dependencies.filter((dep) => !enabledSet.has(dep));
    if (missing.length > 0) {
      missingRequired.push({ pluginId: manifest.id, missing });
    }
    optionalWired[manifest.id] = (manifest.optionalDependencies ?? []).filter((dep) =>
      enabledSet.has(dep),
    );
  }

  const { order, cycles } = topologicalSort(enabledManifests, enabledSet);

  const ok =
    unknownPlugins.length === 0 &&
    missingRequired.length === 0 &&
    cycles.length === 0;

  return {
    ok,
    loadOrder: order,
    missingRequired,
    unknownPlugins,
    cycles,
    optionalWired,
  };
}

/**
 * Kahn's algorithm over required dependencies (restricted to the enabled set). Returns a
 * dependency-first order plus any nodes left in cycles.
 */
function topologicalSort(
  manifests: readonly PluginManifest[],
  enabledSet: ReadonlySet<string>,
): { order: string[]; cycles: string[][] } {
  const indegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const manifest of manifests) {
    indegree.set(manifest.id, 0);
  }

  for (const manifest of manifests) {
    for (const dep of manifest.dependencies) {
      if (!enabledSet.has(dep)) continue; // missing deps handled separately
      indegree.set(manifest.id, (indegree.get(manifest.id) ?? 0) + 1);
      const list = dependents.get(dep) ?? [];
      list.push(manifest.id);
      dependents.set(dep, list);
    }
  }

  const queue = [...indegree.entries()]
    .filter(([, degree]) => degree === 0)
    .map(([id]) => id)
    .sort();

  const order: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    order.push(id);
    for (const dependent of dependents.get(id) ?? []) {
      const next = (indegree.get(dependent) ?? 0) - 1;
      indegree.set(dependent, next);
      if (next === 0) {
        queue.push(dependent);
        queue.sort();
      }
    }
  }

  const remaining = manifests.map((m) => m.id).filter((id) => !order.includes(id));
  const cycles = remaining.length > 0 ? [remaining] : [];

  return { order, cycles };
}
