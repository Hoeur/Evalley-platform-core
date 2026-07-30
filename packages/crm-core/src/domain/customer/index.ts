import type { Id } from "@platform/shared";
import type { Address, CrmRecord } from "../common.js";

export type CustomerType = "individual" | "company";
export type CustomerStatus = "active" | "inactive" | "prospect" | "archived";

/**
 * A customer: a converted account the business transacts with. Its unified timeline is
 * assembled from CRM activity plus references to orders/rentals/bookings in other modules.
 */
export interface Customer extends CrmRecord {
  readonly customerType: CustomerType;
  readonly companyName?: string;
  readonly displayName: string;
  readonly email?: string;
  readonly phone?: string;
  readonly website?: string;
  readonly taxId?: string;
  readonly billingAddress?: Address;
  readonly shippingAddress?: Address;
  readonly status: CustomerStatus;
  readonly accountManagerId?: Id;
  readonly creditLimit?: number;
  readonly currency: string;
  /** Origin module or lead source, e.g. "ecommerce", "manual", "lead". */
  readonly source?: string;
}
