import type { Id } from "@platform/shared";
import type { CrmEntityType } from "../common.js";

/**
 * CRM audit entry (spec §20). Captures who changed what, before/after values (with
 * sensitive fields masked), and request context. Consumed by `audit-core` when installed.
 */
export interface AuditLogEntry {
  readonly id: Id;
  readonly tenantId: string;
  readonly moduleId: "crm";
  readonly entityType: CrmEntityType | string;
  readonly entityId: Id;
  readonly action: string;
  readonly actorType: "user" | "system" | "integration" | "job";
  readonly actorId?: Id;
  readonly oldValues?: Record<string, unknown>;
  readonly newValues?: Record<string, unknown>;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly requestId?: string;
  readonly createdAt: string;
}
