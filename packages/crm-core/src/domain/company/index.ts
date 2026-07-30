import type { Id } from "@platform/shared";
import type { Address, CrmRecord } from "../common.js";

/**
 * A company/organization. Customers and contacts may belong to one. Kept distinct from
 * Customer so B2B hierarchies (many customers under one parent company) are possible.
 */
export interface Company extends CrmRecord {
  readonly name: string;
  readonly website?: string;
  readonly industry?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly address?: Address;
  readonly accountManagerId?: Id;
}
