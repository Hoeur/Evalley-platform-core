import type { PlatformEventName } from "@platform/shared";

/**
 * A plugin manifest is pure, serializable data describing what a module contributes to
 * the host. It carries no behavior — handlers are bound imperatively in the plugin's
 * `register()` (see ./plugin.ts). Keeping the manifest declarative lets the host inspect,
 * validate and diff modules without executing them.
 */
export interface PluginManifest {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description?: string;

  /** Modules that MUST be present and enabled for this plugin to load. */
  readonly dependencies: readonly string[];
  /** Modules this plugin integrates with when present, but can run without. */
  readonly optionalDependencies?: readonly string[];

  readonly permissions?: readonly PermissionDescriptor[];
  readonly routes?: readonly RouteDescriptor[];
  readonly navigation?: readonly NavigationDescriptor[];
  readonly events?: readonly EventSubscriptionDescriptor[];
  readonly migrations?: readonly MigrationDescriptor[];
  readonly jobs?: readonly JobDescriptor[];
  readonly widgets?: readonly WidgetDescriptor[];
  readonly settings?: readonly SettingDescriptor[];
  readonly featureFlags?: readonly FeatureFlagDescriptor[];
}

export interface PermissionDescriptor {
  /** Dotted key, e.g. "crm.leads.create". */
  readonly key: string;
  readonly description: string;
  /** Record-level scopes this permission supports. */
  readonly scopes?: readonly PermissionScope[];
}

export type PermissionScope = "all" | "team" | "assigned" | "own";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RouteDescriptor {
  /** Stable id used to bind a handler in register(). */
  readonly id: string;
  readonly method: HttpMethod;
  /** Versioned path, e.g. "/api/v1/crm/leads/:id". */
  readonly path: string;
  /** Permission required to call this route (enforced server-side). */
  readonly permission?: string;
  readonly description?: string;
}

export interface NavigationDescriptor {
  readonly key: string;
  readonly label: string;
  readonly href: string;
  /** Lucide icon name, resolved by the host UI. Kept as a string to stay serializable. */
  readonly icon?: string;
  readonly group?: string;
  readonly order?: number;
  readonly permission?: string;
  readonly badge?: string;
}

export interface EventSubscriptionDescriptor {
  readonly event: PlatformEventName | string;
  /** Id of the handler bound in register(). */
  readonly handlerId: string;
  readonly description?: string;
}

export interface MigrationDescriptor {
  readonly name: string;
  readonly checksum?: string;
  readonly description?: string;
}

export interface JobDescriptor {
  readonly id: string;
  /** Cron expression or named schedule. */
  readonly schedule: string;
  readonly description?: string;
}

export interface WidgetDescriptor {
  readonly key: string;
  readonly title: string;
  readonly permission?: string;
  readonly description?: string;
}

export interface SettingDescriptor {
  readonly key: string;
  readonly label: string;
  readonly type: "string" | "number" | "boolean" | "select" | "json";
  readonly defaultValue?: unknown;
}

export interface FeatureFlagDescriptor {
  readonly key: string;
  readonly description: string;
  readonly defaultEnabled: boolean;
}
