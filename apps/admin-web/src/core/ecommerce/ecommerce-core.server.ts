import "server-only";
import {
  createLaravelEcommerceCore,
  type EcommerceRequest,
  type EcommerceTransport,
} from "@platform/ecommerce-core";
import { getEnvironment } from "@/core/config/env.server";
import { getClientAccessToken } from "@/core/auth/session-cookie.server";
import { serverApiRequest } from "@/core/http/api-client.server";

function requestPath(request: EcommerceRequest) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(request.query ?? {})) {
    if (value !== undefined) {
      params.set(
        key,
        typeof value === "boolean" ? (value ? "1" : "0") : String(value),
      );
    }
  }
  const query = params.toString();
  return query ? `${request.path}?${query}` : request.path;
}

const transport: EcommerceTransport = async <T>(request: EcommerceRequest) => {
  const env = getEnvironment();
  const headers: Record<string, string> = {};
  const accessToken =
    (await getClientAccessToken()) ??
    (process.env.NODE_ENV === "production"
      ? undefined
      : env.ECOMMERCE_API_TOKEN);
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const multipart = request.body instanceof FormData;
  if (request.body !== undefined && !multipart) {
    headers["Content-Type"] = "application/json";
  }
  return serverApiRequest<T>(requestPath(request), {
    method: request.method,
    headers,
    body:
      request.body === undefined
        ? undefined
        : multipart
          ? request.body
          : JSON.stringify(request.body),
  });
};

let core: ReturnType<typeof createLaravelEcommerceCore> | undefined;

export function getEcommerceCore() {
  core ??= createLaravelEcommerceCore({ transport, locale: "en" });
  return core;
}
