/** Pagination, sorting and filtering primitives used by every list query. */

export interface PaginationParams {
  readonly page: number;
  readonly limit: number;
}

export type SortDirection = "asc" | "desc";

export interface SortParams {
  readonly field: string;
  readonly direction: SortDirection;
}

/** Pagination metadata returned alongside a page of results (see API spec §14). */
export interface PaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
}

/** A page of items plus its metadata. */
export interface Page<T> {
  readonly items: readonly T[];
  readonly pagination: PaginationMeta;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 25;
export const MAX_LIMIT = 100;

/** Clamp raw pagination input into safe bounds. */
export function normalizePagination(input: Partial<PaginationParams>): PaginationParams {
  const page = Math.max(1, Math.trunc(input.page ?? DEFAULT_PAGE));
  const rawLimit = Math.trunc(input.limit ?? DEFAULT_LIMIT);
  const limit = Math.min(MAX_LIMIT, Math.max(1, rawLimit));
  return { page, limit };
}

/** Compute pagination metadata from params and a total count. */
export function toPaginationMeta(params: PaginationParams, total: number): PaginationMeta {
  const totalPages = params.limit > 0 ? Math.ceil(total / params.limit) : 0;
  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasNext: params.page < totalPages,
    hasPrevious: params.page > 1,
  };
}
