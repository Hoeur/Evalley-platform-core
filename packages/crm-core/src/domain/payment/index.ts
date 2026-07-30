import type { Id } from "@platform/shared";
import type { CrmRecord } from "../common.js";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

/**
 * A payment recorded against an invoice. `metadata` may hold gateway data but MUST NOT
 * contain sensitive card details — those are masked before persistence (spec §21).
 */
export interface Payment extends CrmRecord {
  readonly invoiceId: Id;
  readonly paymentMethod: string;
  readonly transactionReference?: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: PaymentStatus;
  readonly paidAt?: string | null;
  readonly metadata?: Record<string, unknown>;
}
