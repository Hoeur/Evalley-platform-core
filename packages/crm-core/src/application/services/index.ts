import type { Id, Page, TenantContext } from "@platform/shared";
import type {
  Customer,
  Lead,
  Opportunity,
  Proposal,
  Invoice,
  Payment,
  Ticket,
} from "../../domain/index.js";
import type {
  CloseOpportunityInput,
  ConvertLeadInput,
  CreateCustomerInput,
  CreateLeadInput,
  CreateOpportunityInput,
  CreateProposalInput,
  CreateTicketInput,
  MoveOpportunityStageInput,
  RecordPaymentInput,
  UpdateLeadInput,
} from "../commands/index.js";
import type {
  CustomerListFilters,
  LeadListFilters,
  ListQuery,
  OpportunityListFilters,
} from "../queries/index.js";
import type { LeadConversionResult, TimelineEntry } from "../dto/index.js";

/**
 * Application service (use-case) interfaces. Every method takes a resolved
 * {@link TenantContext} as its first argument — the single, trusted source of tenant and
 * actor. Controllers stay thin by delegating straight to these; repositories stay free of
 * business rules. Concrete implementations arrive in later phases.
 */

export interface LeadService {
  list(ctx: TenantContext, query: ListQuery<LeadListFilters>): Promise<Page<Lead>>;
  getById(ctx: TenantContext, id: Id): Promise<Lead>;
  create(ctx: TenantContext, input: CreateLeadInput): Promise<Lead>;
  update(ctx: TenantContext, id: Id, input: UpdateLeadInput): Promise<Lead>;
  assign(ctx: TenantContext, id: Id, assigneeId: Id): Promise<Lead>;
  /** Transactional: creates customer + primary contact + optional opportunity, copies
   * notes/activities/tags/attachments, marks the lead converted. */
  convert(ctx: TenantContext, input: ConvertLeadInput): Promise<LeadConversionResult>;
  /** Duplicate detection by email/phone before create (spec §6). */
  findPotentialDuplicates(ctx: TenantContext, email?: string, phone?: string): Promise<Lead[]>;
}

export interface CustomerService {
  list(ctx: TenantContext, query: ListQuery<CustomerListFilters>): Promise<Page<Customer>>;
  getById(ctx: TenantContext, id: Id): Promise<Customer>;
  create(ctx: TenantContext, input: CreateCustomerInput): Promise<Customer>;
  /** Unified timeline merged from CRM plus references to installed modules (spec §6). */
  getTimeline(ctx: TenantContext, id: Id): Promise<TimelineEntry[]>;
}

export interface OpportunityService {
  list(
    ctx: TenantContext,
    query: ListQuery<OpportunityListFilters>,
  ): Promise<Page<Opportunity>>;
  create(ctx: TenantContext, input: CreateOpportunityInput): Promise<Opportunity>;
  /** Authorized, server-validated stage move (spec §6). */
  moveStage(ctx: TenantContext, input: MoveOpportunityStageInput): Promise<Opportunity>;
  close(ctx: TenantContext, input: CloseOpportunityInput): Promise<Opportunity>;
}

export interface ProposalService {
  create(ctx: TenantContext, input: CreateProposalInput): Promise<Proposal>;
  send(ctx: TenantContext, id: Id): Promise<Proposal>;
  accept(ctx: TenantContext, id: Id): Promise<Proposal>;
  /** Generate an invoice from an accepted proposal. */
  convertToInvoice(ctx: TenantContext, id: Id): Promise<Invoice>;
}

export interface InvoiceService {
  getById(ctx: TenantContext, id: Id): Promise<Invoice>;
  recordPayment(ctx: TenantContext, input: RecordPaymentInput): Promise<Payment>;
}

export interface TicketService {
  create(ctx: TenantContext, input: CreateTicketInput): Promise<Ticket>;
  assign(ctx: TenantContext, id: Id, assigneeId: Id): Promise<Ticket>;
  close(ctx: TenantContext, id: Id): Promise<Ticket>;
}
