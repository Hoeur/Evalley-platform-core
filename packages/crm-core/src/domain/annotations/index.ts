import type { Id } from "@platform/shared";
import type { CrmEntityType, CrmRecord } from "../common.js";

/**
 * Cross-cutting attachments to CRM entities: tags, notes, comments, files. All are
 * polymorphic via (entityType, entityId) so they attach to any aggregate.
 */

export interface Tag extends CrmRecord {
  readonly name: string;
  readonly color?: string;
}

/** Join between a tag and any entity. */
export interface EntityTag {
  readonly id: Id;
  readonly tenantId: CrmRecord["tenantId"];
  readonly tagId: Id;
  readonly entityType: CrmEntityType;
  readonly entityId: Id;
}

export interface Note extends CrmRecord {
  readonly entityType: CrmEntityType;
  readonly entityId: Id;
  readonly body: string;
  readonly createdBy: Id;
}

export interface Comment extends CrmRecord {
  readonly entityType: CrmEntityType;
  readonly entityId: Id;
  readonly body: string;
  readonly authorId: Id;
}

/** A file attached to an entity. Stored via a signed-URL storage port (spec §21). */
export interface Attachment extends CrmRecord {
  readonly entityType: CrmEntityType;
  readonly entityId: Id;
  readonly fileName: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly storageKey: string;
  readonly uploadedBy: Id;
}
