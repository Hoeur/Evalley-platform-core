import type { CrmRecord } from "../common.js";

/**
 * Per-tenant CRM configuration. Terminology, numbering and enabled sub-features are here
 * so a client tailors behavior without touching the core (spec §11).
 */
export interface CrmSettings extends CrmRecord {
  readonly defaultCurrency: string;
  readonly proposalNumberPrefix: string;
  readonly invoiceNumberPrefix: string;
  readonly ticketNumberPrefix: string;
  /** Client-facing relabelling, e.g. { lead: "Prospect", customer: "Member" }. */
  readonly terminology: Readonly<Record<string, string>>;
  /** Toggles for optional CRM sub-features (contracts, tickets, proposals…). */
  readonly features: Readonly<Record<string, boolean>>;
}
