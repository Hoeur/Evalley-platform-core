import type { TenantContext } from "@platform/shared";

/**
 * Attachment storage port. Files are tenant-partitioned and served through short-lived
 * signed URLs; the implementation enforces type/size limits and never returns a public
 * path (spec §21). Phase 1 defines the port; a driver is provided later.
 */
export interface AttachmentStorage {
  /** Persist bytes and return an opaque storage key scoped to the tenant. */
  put(
    ctx: TenantContext,
    input: {
      readonly fileName: string;
      readonly contentType: string;
      readonly bytes: Uint8Array;
    },
  ): Promise<{ readonly storageKey: string; readonly sizeBytes: number }>;

  /** Issue a time-limited signed URL for download. */
  getSignedUrl(
    ctx: TenantContext,
    storageKey: string,
    expiresInSeconds?: number,
  ): Promise<string>;
}

/** Allowed upload constraints, overridable per client. */
export interface UploadPolicy {
  readonly maxSizeBytes: number;
  readonly allowedContentTypes: readonly string[];
}
