/**
 * Discriminated result type for operations that can fail in expected ways, without
 * throwing. Domain/application layers return `Result`; only truly exceptional conditions
 * throw.
 */
export type Result<T, E = AppError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/** Normalized application error shape (safe to surface to API/error responses). */
export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
}

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E = AppError>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function appError(code: string, message: string, details?: unknown): AppError {
  return { code, message, details };
}
