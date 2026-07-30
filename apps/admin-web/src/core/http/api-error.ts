import type { ApiError } from "./api-client.types";
export class ApiClientError extends Error {
  constructor(readonly details: ApiError) {
    super(details.message);
    this.name = "ApiClientError";
  }
}
