import type { Id } from "@platform/shared";
import type { CrmEntityType, CrmRecord } from "../common.js";

export type ActivityType =
  | "call"
  | "meeting"
  | "email"
  | "message"
  | "follow_up"
  | "demo"
  | "site_visit"
  | "custom";

export type ActivityStatus = "planned" | "completed" | "cancelled" | "overdue";

/**
 * A logged or scheduled interaction attached to any CRM entity. Feeds the customer
 * timeline, calendar and overdue/reminder jobs.
 */
export interface Activity extends CrmRecord {
  readonly entityType: CrmEntityType;
  readonly entityId: Id;
  readonly activityType: ActivityType;
  readonly subject: string;
  readonly description?: string;
  readonly assignedUserId?: Id;
  readonly scheduledAt?: string | null;
  readonly completedAt?: string | null;
  readonly status: ActivityStatus;
  readonly outcome?: string;
  readonly createdBy: Id;
}
