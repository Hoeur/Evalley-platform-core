import type { Id } from "@platform/shared";
import type { CrmEntityType, CrmRecord } from "../common.js";

/** Channels through which the business communicates with a customer. */
export type CommunicationChannel = "email" | "sms" | "call" | "chat" | "portal" | "webhook";
export type CommunicationDirection = "inbound" | "outbound";

/** A logged email (sent or received), linked to an entity for the timeline. */
export interface EmailLog extends CrmRecord {
  readonly entityType: CrmEntityType;
  readonly entityId: Id;
  readonly direction: CommunicationDirection;
  readonly fromAddress: string;
  readonly toAddress: string;
  readonly subject: string;
  readonly status: "queued" | "sent" | "delivered" | "failed" | "received";
}

/** A generic communication entry (superset of email) for the unified timeline. */
export interface CommunicationLog extends CrmRecord {
  readonly entityType: CrmEntityType;
  readonly entityId: Id;
  readonly channel: CommunicationChannel;
  readonly direction: CommunicationDirection;
  readonly summary: string;
  readonly occurredAt: string;
}
