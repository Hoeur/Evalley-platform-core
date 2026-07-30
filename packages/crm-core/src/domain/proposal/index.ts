import type { Id } from "@platform/shared";
import type { CrmRecord } from "../common.js";

export type ProposalStatus = "draft" | "sent" | "accepted" | "declined" | "expired";

/**
 * A commercial proposal to a customer, optionally derived from an opportunity. Its line
 * items may reference products/services owned by other modules (see {@link ProposalItem}).
 */
export interface Proposal extends CrmRecord {
  readonly proposalNumber: string;
  readonly customerId: Id;
  readonly contactId?: Id;
  readonly opportunityId?: Id;
  readonly status: ProposalStatus;
  readonly issueDate: string;
  readonly expiryDate?: string | null;
  readonly currency: string;
  readonly subtotal: number;
  readonly discountTotal: number;
  readonly taxTotal: number;
  readonly grandTotal: number;
  readonly notes?: string;
  readonly terms?: string;
  readonly createdBy: Id;
}

/** What a proposal/estimate/invoice line points at. */
export type LineReferenceType =
  | "ecommerce_product"
  | "rental_item"
  | "booking_service"
  | "custom_item";

/** A single proposal line. `referenceType`/`referenceId` link to an external catalog. */
export interface ProposalItem {
  readonly id: Id;
  readonly proposalId: Id;
  readonly referenceType: LineReferenceType;
  readonly referenceId?: Id;
  readonly name: string;
  readonly description?: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly discount: number;
  readonly taxRate: number;
  readonly total: number;
  readonly position: number;
}
