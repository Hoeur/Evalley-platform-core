import type { EventBus, EventHandler } from "@platform/shared";

/**
 * Context handed to a plugin during registration and lifecycle transitions. It is the
 * ONLY surface a plugin uses to reach the host, which keeps modules decoupled from the
 * concrete runtime. Concrete implementations are provided by `platform-core`.
 */
export interface PluginContext {
  /** Ids of modules currently enabled — lets a plugin adapt to optional dependencies. */
  readonly enabledModules: readonly string[];
  readonly logger: PluginLogger;
  readonly events: EventBus;

  /** Register an HTTP handler previously declared as a RouteDescriptor. */
  bindRoute(routeId: string, handler: RouteHandler): void;
  /** Register an event handler previously declared as an EventSubscriptionDescriptor. */
  bindEventHandler(handler: EventHandler): void;
  /** Register a background job runner previously declared as a JobDescriptor. */
  bindJob(jobId: string, run: JobRunner): void;

  /** Whether an optional module is available in this deployment. */
  hasModule(moduleId: string): boolean;
}

export interface PluginLogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

/** Opaque request/response contract; concrete types live in the API layer. */
export type RouteHandler = (request: unknown) => Promise<unknown>;
export type JobRunner = (context: { readonly tenantId: string }) => Promise<void>;

/**
 * Optional lifecycle hooks. A disabled plugin contributes nothing to the host — no
 * routes, navigation, jobs, workers or widgets — so hooks are the only place a module
 * runs side effects (migrations on install, warm-up on start, cleanup on stop).
 */
export interface PluginLifecycle {
  onInstall?(ctx: PluginContext): Promise<void>;
  onEnable?(ctx: PluginContext): Promise<void>;
  onDisable?(ctx: PluginContext): Promise<void>;
  onUninstall?(ctx: PluginContext): Promise<void>;
  onApplicationStart?(ctx: PluginContext): Promise<void>;
  onApplicationStop?(ctx: PluginContext): Promise<void>;
}
