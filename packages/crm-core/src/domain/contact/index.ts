import type { Id } from "@platform/shared";
import type { CrmRecord } from "../common.js";

export type ContactStatus = "active" | "inactive";

/** A person associated with a customer account. One contact may be the primary. */
export interface Contact extends CrmRecord {
  readonly customerId: Id;
  readonly firstName: string;
  readonly lastName: string;
  readonly jobTitle?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly isPrimary: boolean;
  readonly canAccessPortal: boolean;
  readonly status: ContactStatus;
}
