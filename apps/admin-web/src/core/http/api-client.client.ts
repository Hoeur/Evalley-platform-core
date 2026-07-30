import { ApiClientError } from "./api-error";
import type { ApiRequestOptions } from "./api-client.types";

export async function clientApiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await fetch(path, options);
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiClientError({
      status: response.status,
      code: "BROWSER_REQUEST_FAILED",
      message: `Request failed with status ${response.status}`,
    });
  }
  return data as T;
}
