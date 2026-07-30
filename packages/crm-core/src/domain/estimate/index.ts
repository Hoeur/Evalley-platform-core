import type { Id } from "@platform/shared";
import type { CrmRecord } from "../common.js";
import type { LineReferenceType } from "../proposal/index.js";

export type EstimateStatus = "draft" | "sent" | "accepted" | "declined" | "expired";

/**
 * A priced estimate/quote. Structurally close to a proposal but typically lighter-weight
 * and convertible into an invoice.
 */
export interface Estimate extends CrmRecord {
  readonly estimateNumber: string;
  readonly customerId: Id;
  readonly contactId?: Id;
  readonly opportunityId?: Id;
  readonly status: EstimateStatus;
  readonly issueDate: string;
  readonly expiryDate?: string | null;
  readonly currency: string;
  readonly subtotal: number;
  readonly discountTotal: number;
  readonly taxTotal: number;
  readonly grandTotal: number;
  readonly notes?: string;
  readonly createdBy: Id;
}

export interface EstimateItem {
  readonly id: Id;
  readonly estimateId: Id;
  readonly referenceType: LineReferenceType;
  readonly referenceId?: Id;
  readonly name: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly discount: number;
  readonly taxRate: number;
  readonly total: number;
  readonly position: number;
}
