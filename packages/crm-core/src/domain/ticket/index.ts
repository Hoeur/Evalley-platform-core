import type { Id } from "@platform/shared";
import type { CrmRecord, Priority } from "../common.js";

export type TicketStatus = "open" | "pending" | "on_hold" | "resolved" | "closed";
export type TicketSource = "email" | "portal" | "phone" | "chat" | "manual";

/** A support ticket raised by or on behalf of a customer. */
export interface Ticket extends CrmRecord {
  readonly ticketNumber: string;
  readonly customerId?: Id;
  readonly contactId?: Id;
  readonly subject: string;
  readonly description?: string;
  readonly departmentId?: Id;
  readonly priority: Priority;
  readonly status: TicketStatus;
  readonly assignedUserId?: Id;
  readonly source: TicketSource;
  readonly closedAt?: string | null;
}

/** A queue/department tickets are routed to. */
export interface TicketDepartment extends CrmRecord {
  readonly name: string;
  readonly email?: string;
  readonly isActive: boolean;
}

/** A message within a ticket thread (staff reply or customer message). */
export interface TicketMessage extends CrmRecord {
  readonly ticketId: Id;
  readonly authorType: "staff" | "customer" | "system";
  readonly authorId?: Id;
  readonly body: string;
  readonly isInternalNote: boolean;
}
