import type { PaginationMeta } from "./pagination.js";

/**
 * Standard API envelopes (see spec §14). Controllers always wrap payloads in these so
 * every module returns a consistent success / paginated / error shape with a requestId.
 */

export interface ResponseMeta {
  readonly requestId: string;
  readonly [key: string]: unknown;
}

export interface ApiSuccess<T> {
  readonly success: true;
  readonly data: T;
  readonly meta: ResponseMeta;
}

export interface ApiPaginated<T> {
  readonly success: true;
  readonly data: readonly T[];
  readonly pagination: PaginationMeta;
  readonly meta: ResponseMeta;
}

export interface ApiFailure {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
  readonly meta: ResponseMeta;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function apiSuccess<T>(data: T, requestId: string): ApiSuccess<T> {
  return { success: true, data, meta: { requestId } };
}

export function apiPaginated<T>(
  data: readonly T[],
  pagination: PaginationMeta,
  requestId: string,
): ApiPaginated<T> {
  return { success: true, data, pagination, meta: { requestId } };
}

export function apiFailure(
  code: string,
  message: string,
  requestId: string,
  details?: unknown,
): ApiFailure {
  return { success: false, error: { code, message, details }, meta: { requestId } };
}
