import type { DomainEvent, Id } from "@platform/shared";
import { CRM_EVENTS } from "@platform/shared";

/**
 * CRM outbound events. Payload shapes are part of the public integration contract — other
 * modules subscribe to these — so they are kept minimal and stable (ids + essentials),
 * not full entity dumps.
 */

export interface LeadCreatedPayload {
  readonly leadId: Id;
  readonly assignedUserId?: Id;
}
export interface LeadAssignedPayload {
  readonly leadId: Id;
  readonly assignedUserId: Id;
}
export interface LeadConvertedPayload {
  readonly leadId: Id;
  readonly customerId: Id;
  readonly opportunityId?: Id;
}
export interface CustomerCreatedPayload {
  readonly customerId: Id;
}
export interface OpportunityStageChangedPayload {
  readonly opportunityId: Id;
  readonly fromStageId: Id;
  readonly toStageId: Id;
}
export interface OpportunityClosedPayload {
  readonly opportunityId: Id;
  readonly outcome: "won" | "lost";
  readonly amount: number;
  readonly currency: string;
}
export interface InvoicePaidPayload {
  readonly invoiceId: Id;
  readonly amount: number;
  readonly currency: string;
}

export type CrmDomainEvent =
  | DomainEvent<typeof CRM_EVENTS.leadCreated, LeadCreatedPayload>
  | DomainEvent<typeof CRM_EVENTS.leadAssigned, LeadAssignedPayload>
  | DomainEvent<typeof CRM_EVENTS.leadConverted, LeadConvertedPayload>
  | DomainEvent<typeof CRM_EVENTS.customerCreated, CustomerCreatedPayload>
  | DomainEvent<typeof CRM_EVENTS.opportunityStageChanged, OpportunityStageChangedPayload>
  | DomainEvent<typeof CRM_EVENTS.opportunityWon, OpportunityClosedPayload>
  | DomainEvent<typeof CRM_EVENTS.opportunityLost, OpportunityClosedPayload>
  | DomainEvent<typeof CRM_EVENTS.invoicePaid, InvoicePaidPayload>;

/** Re-export the CRM event-name constants for convenience. */
export { CRM_EVENTS };
