import "server-only";
import { getEnvironment } from "@/core/config/env.server";
import { ApiClientError } from "./api-error";
import type { ApiRequestOptions } from "./api-client.types";

function laravelError(data: unknown) {
  if (!data || typeof data !== "object") return undefined;
  const candidate = data as {
    error_code?: unknown;
    error_message?: unknown;
    error_fields?: unknown;
  };
  return {
    code:
      typeof candidate.error_code === "string" && candidate.error_code
        ? candidate.error_code
        : "API_REQUEST_FAILED",
    message:
      typeof candidate.error_message === "string" && candidate.error_message
        ? candidate.error_message
        : undefined,
    fieldErrors:
      candidate.error_fields &&
      typeof candidate.error_fields === "object" &&
      !Array.isArray(candidate.error_fields)
        ? (candidate.error_fields as Record<string, string[]>)
        : undefined,
  };
}

export async function serverApiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const env = getEnvironment();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? env.API_TIMEOUT_MS,
  );
  try {
    const response = await fetch(`${env.API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { Accept: "application/json", ...options.headers },
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const error = laravelError(data);
      throw new ApiClientError({
        status: response.status,
        code: error?.code ?? "API_REQUEST_FAILED",
        message: error?.message ?? `API request failed with status ${response.status}`,
        fieldErrors: error?.fieldErrors,
        requestId: response.headers.get("x-request-id") ?? undefined,
      });
    }
    return data as T;
  } finally {
    clearTimeout(timeout);
  }
}
