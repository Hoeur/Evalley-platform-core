import type { Id } from "@platform/shared";
import type { CrmRecord } from "../common.js";
import type { LineReferenceType } from "../proposal/index.js";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "void";

/**
 * An invoice. May originate from a proposal or from an order in another module
 * (`orderReferenceType`/`orderReferenceId`) — CRM stores the reference, it does not own
 * the order's business logic.
 */
export interface Invoice extends CrmRecord {
  readonly invoiceNumber: string;
  readonly customerId: Id;
  readonly contactId?: Id;
  readonly proposalId?: Id;
  readonly orderReferenceType?: "ecommerce_order" | "rental_contract" | "booking";
  readonly orderReferenceId?: Id;
  readonly status: InvoiceStatus;
  readonly issueDate: string;
  readonly dueDate?: string | null;
  readonly currency: string;
  readonly subtotal: number;
  readonly discountTotal: number;
  readonly taxTotal: number;
  readonly paidTotal: number;
  readonly balanceDue: number;
  readonly grandTotal: number;
  readonly notes?: string;
  readonly terms?: string;
}

export interface InvoiceItem {
  readonly id: Id;
  readonly invoiceId: Id;
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
