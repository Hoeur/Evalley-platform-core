import type { Id, Page, TenantContext } from "@platform/shared";
import type {
  Contact,
  Customer,
  Invoice,
  Lead,
  Opportunity,
  Payment,
  Pipeline,
  PipelineStage,
  Proposal,
  Ticket,
} from "../../domain/index.js";
import type {
  CustomerListFilters,
  LeadListFilters,
  ListQuery,
  OpportunityListFilters,
} from "../../application/queries/index.js";

/**
 * Persistence ports. Repositories are the ONLY place data is read or written, and every
 * method takes a {@link TenantContext} so the tenant filter can never be forgotten — the
 * implementation adds `WHERE tenant_id = ctx.tenantId` to every query (spec §5).
 * Repositories hold no business rules; services orchestrate them.
 *
 * Phase 1 defines the ports only. A later phase provides an in-memory (dummy-data)
 * implementation and, eventually, a backend-backed one.
 */

/** Common read/write shape shared by simple aggregates. */
export interface TenantAwareRepository<TEntity, TCreate, TUpdate, TFilters> {
  findById(ctx: TenantContext, id: Id): Promise<TEntity | null>;
  list(ctx: TenantContext, query: ListQuery<TFilters>): Promise<Page<TEntity>>;
  create(ctx: TenantContext, data: TCreate): Promise<TEntity>;
  update(ctx: TenantContext, id: Id, data: TUpdate): Promise<TEntity>;
  softDelete(ctx: TenantContext, id: Id): Promise<void>;
}

export type LeadRepository = TenantAwareRepository<
  Lead,
  Partial<Lead>,
  Partial<Lead>,
  LeadListFilters
>;

export type CustomerRepository = TenantAwareRepository<
  Customer,
  Partial<Customer>,
  Partial<Customer>,
  CustomerListFilters
>;

export type OpportunityRepository = TenantAwareRepository<
  Opportunity,
  Partial<Opportunity>,
  Partial<Opportunity>,
  OpportunityListFilters
>;

export interface ContactRepository {
  findById(ctx: TenantContext, id: Id): Promise<Contact | null>;
  listByCustomer(ctx: TenantContext, customerId: Id): Promise<Contact[]>;
  create(ctx: TenantContext, data: Partial<Contact>): Promise<Contact>;
  update(ctx: TenantContext, id: Id, data: Partial<Contact>): Promise<Contact>;
}

export interface PipelineRepository {
  listPipelines(ctx: TenantContext): Promise<Pipeline[]>;
  listStages(ctx: TenantContext, pipelineId: Id): Promise<PipelineStage[]>;
}

export interface ProposalRepository {
  findById(ctx: TenantContext, id: Id): Promise<Proposal | null>;
  create(ctx: TenantContext, data: Partial<Proposal>): Promise<Proposal>;
  update(ctx: TenantContext, id: Id, data: Partial<Proposal>): Promise<Proposal>;
}

export interface InvoiceRepository {
  findById(ctx: TenantContext, id: Id): Promise<Invoice | null>;
  create(ctx: TenantContext, data: Partial<Invoice>): Promise<Invoice>;
  update(ctx: TenantContext, id: Id, data: Partial<Invoice>): Promise<Invoice>;
  recordPayment(ctx: TenantContext, data: Partial<Payment>): Promise<Payment>;
}

export interface TicketRepository {
  findById(ctx: TenantContext, id: Id): Promise<Ticket | null>;
  create(ctx: TenantContext, data: Partial<Ticket>): Promise<Ticket>;
  update(ctx: TenantContext, id: Id, data: Partial<Ticket>): Promise<Ticket>;
}

/**
 * Unit-of-work: run multiple repository operations atomically. The lead-conversion use
 * case and any multi-step write must go through this so partial writes cannot occur.
 */
export interface UnitOfWork {
  transaction<T>(ctx: TenantContext, work: () => Promise<T>): Promise<T>;
}
