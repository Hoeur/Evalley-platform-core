import { ApiClientError } from "./api-error";
import type { ApiError } from "./api-client.types";

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiClientError) return error.details;
  return {
    status: 500,
    code: "UNEXPECTED_ERROR",
    message: error instanceof Error ? error.message : "Unexpected error",
  };
}
