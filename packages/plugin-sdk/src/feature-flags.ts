import type { FeatureFlagDescriptor } from "./manifest.js";

/**
 * Feature flags let a client toggle behavior without code changes. Defaults come from a
 * plugin's manifest; client config overrides them per deployment.
 */
export interface FeatureFlagState {
  readonly key: string;
  readonly enabled: boolean;
}

/** Resolve effective flag state from manifest defaults and client overrides. */
export function resolveFeatureFlags(
  descriptors: readonly FeatureFlagDescriptor[],
  overrides: Readonly<Record<string, boolean>> = {},
): FeatureFlagState[] {
  return descriptors.map((descriptor) => ({
    key: descriptor.key,
    enabled: overrides[descriptor.key] ?? descriptor.defaultEnabled,
  }));
}

/** Convenience lookup over resolved flags. */
export function isFeatureEnabled(
  flags: readonly FeatureFlagState[],
  key: string,
): boolean {
  return flags.find((flag) => flag.key === key)?.enabled ?? false;
}
