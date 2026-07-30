import type { Id } from "../ids.js";
import type { TenantId, Actor } from "../tenant.js";
import type { PlatformEventName } from "./event-names.js";

/**
 * Tenant-aware event envelope. Every integration event carries its own id (for
 * idempotency), the tenant it belongs to, who/what raised it, when it occurred, and a
 * typed payload. Handlers must be idempotent, retry-safe and tenant-aware.
 */
export interface DomainEvent<TName extends string = PlatformEventName, TPayload = unknown> {
  /** Unique event id — consumers store this to guarantee exactly-once processing. */
  readonly id: Id;
  readonly name: TName;
  readonly tenantId: TenantId;
  readonly occurredAt: string;
  readonly actor?: Actor;
  /** Optional correlation id linking a chain of events/requests. */
  readonly correlationId?: string;
  readonly payload: TPayload;
}

/** A subscriber for a specific event. Implementations must be idempotent. */
export interface EventHandler<E extends DomainEvent = DomainEvent> {
  readonly event: E["name"];
  handle(event: E): Promise<void>;
}

/**
 * Minimal publish/subscribe contract. `platform-core` provides the concrete bus in a
 * later phase; add-ons depend only on this interface.
 */
export interface EventBus {
  publish<E extends DomainEvent>(event: E): Promise<void>;
  subscribe<E extends DomainEvent>(handler: EventHandler<E>): void;
}

/**
 * Idempotency ledger: records processed event ids per tenant so a redelivered event is
 * skipped. Backed by a table/store in a later phase.
 */
export interface ProcessedEventStore {
  has(tenantId: TenantId, eventId: Id): Promise<boolean>;
  markProcessed(tenantId: TenantId, eventId: Id): Promise<void>;
}
