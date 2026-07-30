/**
 * Canonical integration event names. Modules publish and subscribe by these constants
 * only — never by hand-typed strings — so producers and consumers cannot drift.
 */

export const CRM_EVENTS = {
  leadCreated: "crm.lead.created",
  leadAssigned: "crm.lead.assigned",
  leadConverted: "crm.lead.converted",
  customerCreated: "crm.customer.created",
  customerUpdated: "crm.customer.updated",
  opportunityCreated: "crm.opportunity.created",
  opportunityStageChanged: "crm.opportunity.stage_changed",
  opportunityWon: "crm.opportunity.won",
  opportunityLost: "crm.opportunity.lost",
  proposalCreated: "crm.proposal.created",
  proposalAccepted: "crm.proposal.accepted",
  invoiceCreated: "crm.invoice.created",
  invoicePaid: "crm.invoice.paid",
  ticketCreated: "crm.ticket.created",
  ticketClosed: "crm.ticket.closed",
} as const;

export const ECOMMERCE_EVENTS = {
  customerCreated: "ecommerce.customer.created",
  orderPlaced: "ecommerce.order.placed",
  orderCompleted: "ecommerce.order.completed",
  orderCancelled: "ecommerce.order.cancelled",
} as const;

export const RENTAL_EVENTS = {
  customerCreated: "rental.customer.created",
  reservationCreated: "rental.reservation.created",
  contractSigned: "rental.contract.signed",
  itemReturned: "rental.item.returned",
} as const;

export const BOOKING_EVENTS = {
  customerCreated: "booking.customer.created",
  created: "booking.created",
  confirmed: "booking.confirmed",
  cancelled: "booking.cancelled",
  completed: "booking.completed",
} as const;

/** Union of every known event name across modules. */
export const PLATFORM_EVENTS = {
  ...CRM_EVENTS,
  ...ECOMMERCE_EVENTS,
  ...RENTAL_EVENTS,
  ...BOOKING_EVENTS,
} as const;

type ValueOf<T> = T[keyof T];

export type CrmEventName = ValueOf<typeof CRM_EVENTS>;
export type EcommerceEventName = ValueOf<typeof ECOMMERCE_EVENTS>;
export type RentalEventName = ValueOf<typeof RENTAL_EVENTS>;
export type BookingEventName = ValueOf<typeof BOOKING_EVENTS>;
export type PlatformEventName = ValueOf<typeof PLATFORM_EVENTS>;
