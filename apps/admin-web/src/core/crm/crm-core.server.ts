import "server-only";
import {
  createNestCrmCore,
  type CrmRequest,
  type CrmTransport,
} from "@platform/crm-core/api-client";
import { getClientAccessToken } from "@/core/auth/session-cookie.server";
import { getEnvironment } from "@/core/config/env.server";
import type { AppEnvironment } from "@/core/config/env.schema";
import { ApiClientError } from "@/core/http/api-error";

type NestFailure = {
  readonly success?: false;
  readonly error?: {
    readonly code?: string;
    readonly message?: string;
    readonly details?: readonly {
      readonly field?: string;
      readonly message?: string;
    }[];
  };
  readonly meta?: {
    readonly requestId?: string;
  };
};

type NestSuccess<T> = {
  readonly success: true;
  readonly data: T;
};

type CrmAuthTokens = {
  readonly accessToken: string;
  readonly accessTokenExpiresIn: number;
  readonly refreshToken: string;
};

type CachedCrmTokens = CrmAuthTokens & {
  readonly accessTokenExpiresAt: number;
};

type NestFailureDetails = NonNullable<
  NonNullable<NestFailure["error"]>["details"]
>;

let cachedServiceTokens: CachedCrmTokens | undefined;
let serviceTokenPromise: Promise<string> | undefined;

function requestPath(request: CrmRequest) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(request.query ?? {})) {
    if (value !== undefined) params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `${request.path}?${query}` : request.path;
}

function fieldErrors(details?: NestFailureDetails) {
  if (!details) return undefined;
  const errors: Record<string, string[]> = {};
  for (const detail of details) {
    const field = detail.field ?? "_";
    const message = detail.message;
    if (!message) continue;
    (errors[field] ??= []).push(message);
  }
  return Object.keys(errors).length > 0 ? errors : undefined;
}

function apiError(response: Response, data: unknown) {
  const failure = data as NestFailure | null;
  return new ApiClientError({
    status: response.status,
    code: failure?.error?.code ?? "CRM_API_REQUEST_FAILED",
    message:
      failure?.error?.message ??
      `CRM API request failed with status ${response.status}`,
    fieldErrors: fieldErrors(failure?.error?.details),
    requestId:
      failure?.meta?.requestId ??
      response.headers.get("x-request-id") ??
      undefined,
  });
}

function hasServiceCredentials(env: AppEnvironment) {
  return Boolean(
    env.CRM_API_EMAIL && env.CRM_API_PASSWORD && env.CRM_API_TENANT_SLUG,
  );
}

async function crmFetch<T>(path: string, init: RequestInit): Promise<T> {
  const env = getEnvironment();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.API_TIMEOUT_MS);
  try {
    const response = await fetch(`${env.CRM_API_BASE_URL}${path}`, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...init.headers,
      },
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) throw apiError(response, data);
    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiClientError({
        status: 504,
        code: "CRM_API_TIMEOUT",
        message: "The CRM API did not respond before the request timed out.",
      });
    }
    throw new ApiClientError({
      status: 503,
      code: "CRM_API_UNAVAILABLE",
      message: "The CRM API is unavailable.",
    });
  } finally {
    clearTimeout(timeout);
  }
}

function cacheTokens(tokens: CrmAuthTokens) {
  cachedServiceTokens = {
    ...tokens,
    accessTokenExpiresAt:
      Date.now() + Math.max(30, tokens.accessTokenExpiresIn) * 1_000,
  };
  return tokens.accessToken;
}

async function loginServiceAccount(): Promise<string> {
  const env = getEnvironment();
  if (!hasServiceCredentials(env)) {
    throw new ApiClientError({
      status: 401,
      code: "CRM_AUTH_NOT_CONFIGURED",
      message: "CRM service credentials are not configured.",
    });
  }
  const response = await crmFetch<NestSuccess<CrmAuthTokens>>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: env.CRM_API_EMAIL,
      password: env.CRM_API_PASSWORD,
      tenantSlug: env.CRM_API_TENANT_SLUG,
    }),
  });
  return cacheTokens(response.data);
}

async function refreshServiceAccount(): Promise<string> {
  if (!cachedServiceTokens?.refreshToken) return loginServiceAccount();
  try {
    const response = await crmFetch<NestSuccess<CrmAuthTokens>>(
      "/auth/refresh",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refreshToken: cachedServiceTokens.refreshToken,
        }),
      },
    );
    return cacheTokens(response.data);
  } catch {
    cachedServiceTokens = undefined;
    return loginServiceAccount();
  }
}

async function getServiceAccessToken(forceLogin = false): Promise<string> {
  if (
    !forceLogin &&
    cachedServiceTokens &&
    cachedServiceTokens.accessTokenExpiresAt > Date.now() + 30_000
  ) {
    return cachedServiceTokens.accessToken;
  }
  if (serviceTokenPromise) return serviceTokenPromise;

  serviceTokenPromise = (
    forceLogin ? loginServiceAccount() : refreshServiceAccount()
  ).finally(() => {
    serviceTokenPromise = undefined;
  });
  return serviceTokenPromise;
}

async function resolveAccessToken(forceServiceLogin = false) {
  const env = getEnvironment();
  if (hasServiceCredentials(env)) {
    return getServiceAccessToken(forceServiceLogin);
  }
  return env.CRM_API_TOKEN ?? getClientAccessToken();
}

async function sendCrmRequest<T>(
  request: CrmRequest,
  accessToken?: string,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (request.body !== undefined) headers["Content-Type"] = "application/json";

  return crmFetch<T>(requestPath(request), {
    method: request.method,
    headers,
    body: request.body === undefined ? undefined : JSON.stringify(request.body),
  });
}

const transport: CrmTransport = async <T>(request: CrmRequest) => {
  const env = getEnvironment();
  const accessToken = await resolveAccessToken();
  try {
    return await sendCrmRequest<T>(request, accessToken);
  } catch (error) {
    if (
      error instanceof ApiClientError &&
      error.details.status === 401 &&
      hasServiceCredentials(env)
    ) {
      cachedServiceTokens = undefined;
      return sendCrmRequest<T>(request, await resolveAccessToken(true));
    }
    throw error;
  }
};

let core: ReturnType<typeof createNestCrmCore> | undefined;

export function getCrmCore() {
  core ??= createNestCrmCore({ transport });
  return core;
}
