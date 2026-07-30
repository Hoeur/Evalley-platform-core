import type { Id } from "@platform/shared";
import type { CrmRecord } from "../common.js";

export type ContractStatus =
  | "draft"
  | "sent"
  | "signed"
  | "active"
  | "expired"
  | "terminated";

/** A contract/agreement with a customer. `content` holds the rendered/authored body. */
export interface Contract extends CrmRecord {
  readonly customerId: Id;
  readonly title: string;
  readonly contractNumber: string;
  readonly status: ContractStatus;
  readonly startDate?: string | null;
  readonly endDate?: string | null;
  readonly value?: number;
  readonly currency: string;
  readonly content?: string;
  readonly signedAt?: string | null;
}
