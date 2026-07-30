import type {
  CustomerReference,
  DomainEvent,
  OrderReference,
  ProcessedEventStore,
  TenantContext,
} from "@platform/shared";

/**
 * Inbound integrations. When e-commerce/rental/booking modules are installed, CRM
 * subscribes to their events and reconciles them into the customer timeline. Handlers must
 * be idempotent, retry-safe and tenant-aware; the {@link ProcessedEventStore} guarantees
 * an event is applied at most once (spec §7).
 *
 * CRM stores REFERENCES to external orders/customers — it never duplicates their logic.
 */

/** Ensure a CRM customer exists for an external customer reference; return its id. */
export interface CustomerResolver {
  ensureCustomer(ctx: TenantContext, reference: CustomerReference): Promise<string>;
}

/** Handles an order-completed style event from another module. */
export interface OrderIntegrationHandler {
  /** Idempotency key derived from the source event id. */
  readonly processed: ProcessedEventStore;
  handleOrderCompleted(
    ctx: TenantContext,
    event: DomainEvent<string, { customer: CustomerReference; order: OrderReference }>,
  ): Promise<void>;
}

/**
 * Registry mapping external event names to CRM handlers. Populated only for modules that
 * are actually installed, so CRM runs standalone when they are absent (spec §1, §5).
 */
export interface IntegrationRegistry {
  register(eventName: string, handler: (event: DomainEvent) => Promise<void>): void;
  handlersFor(eventName: string): ReadonlyArray<(event: DomainEvent) => Promise<void>>;
}
