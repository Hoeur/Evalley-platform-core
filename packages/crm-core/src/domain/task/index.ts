import type { Id } from "@platform/shared";
import type { CrmEntityType, CrmRecord, Priority } from "../common.js";

export type TaskStatus = "open" | "in_progress" | "completed" | "cancelled";

/** A to-do attached to any CRM entity, assignable and due-dated. */
export interface Task extends CrmRecord {
  readonly entityType: CrmEntityType;
  readonly entityId: Id;
  readonly title: string;
  readonly description?: string;
  readonly priority: Priority;
  readonly status: TaskStatus;
  readonly assignedUserId?: Id;
  readonly dueDate?: string | null;
  readonly completedAt?: string | null;
  readonly createdBy: Id;
}
