import "server-only";
import { resolveClient } from "@/clients/client-resolver.server";
import { getEnvironment } from "@/core/config/env.server";
import { UnauthorizedError } from "@/core/errors/unauthorized-error";
import { serverApiRequest } from "@/core/http/api-client.server";
import { permissions, type Permission } from "./permissions";
import { resolveSessionPermissions } from "./ecommerce-permission-map";
import {
  clearAuthCookies,
  getClientAccessToken,
  setAuthCookies,
  type AuthTokens,
} from "./session-cookie.server";
import type { Session, SessionUser } from "./session.types";

type MePermissionsEnvelope = {
  readonly data: {
    readonly item: { readonly permissions?: readonly string[] } | null;
  };
};

type TokenDto = {
  readonly access_token: string;
  readonly refresh_token: string | null;
  readonly token_type: string;
  readonly expires_in: number;
};

type TokenEnvelope = {
  readonly data: {
    readonly item: TokenDto | null;
  };
};

export type SignInInput = {
  readonly email: string;
  readonly password: string;
  readonly remember: boolean;
};

function displayName(email: string) {
  return (
    email
      .split("@")[0]
      ?.split(/[._-]/u)
      .filter(Boolean)
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(" ") || "Administrator"
  );
}

function sessionUser(
  email: string,
  clientKey: string,
  grantedPermissions: readonly Permission[],
): SessionUser {
  return {
    id: `${clientKey}:${email.toLowerCase()}`,
    name: displayName(email),
    email: email.toLowerCase(),
    role: "owner",
    permissions: [...grantedPermissions],
  };
}

/**
 * Resolve the admin's real permissions from the commerce API. Falls back to
 * the full set if the RBAC endpoint is unavailable so a login never breaks.
 */
async function resolveAdminPermissions(
  accessToken: string,
): Promise<readonly Permission[]> {
  try {
    const response = await serverApiRequest<MePermissionsEnvelope>(
      "/me/permissions",
      { method: "GET", headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const flags = response.data.item?.permissions;
    if (!Array.isArray(flags)) return permissions;
    return resolveSessionPermissions(flags);
  } catch {
    return permissions;
  }
}

async function ecommerceLogin(
  email: string,
  password: string,
): Promise<AuthTokens> {
  const response = await serverApiRequest<TokenEnvelope>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const token = response.data.item;
  if (!token?.access_token) {
    throw new UnauthorizedError(
      "The authentication response did not contain an access token.",
    );
  }
  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresIn: token.expires_in,
  };
}

function validateMockCredentials(
  clientKey: string,
  email: string,
  password: string,
) {
  const env = getEnvironment();
  if (
    process.env.NODE_ENV === "production" &&
    (!env.AUTH_MOCK_EMAIL || !env.AUTH_MOCK_PASSWORD)
  ) {
    throw new Error(
      "Mock authentication credentials must be configured in production.",
    );
  }
  const expectedEmail = env.AUTH_MOCK_EMAIL ?? `admin@${clientKey}.local`;
  const expectedPassword = env.AUTH_MOCK_PASSWORD ?? "password";
  if (
    email.trim().toLowerCase() !== expectedEmail.toLowerCase() ||
    password !== expectedPassword
  ) {
    throw new UnauthorizedError("Invalid email or password.");
  }
}

export async function signIn(input: SignInInput) {
  const client = resolveClient();
  let tokens: AuthTokens | null = null;
  let grantedPermissions: readonly Permission[] = permissions;
  if (client.server.auth.adapter === "ecommerce-api") {
    tokens = await ecommerceLogin(input.email, input.password);
    grantedPermissions = await resolveAdminPermissions(tokens.accessToken);
  } else {
    validateMockCredentials(client.public.key, input.email, input.password);
  }

  const sessionLifetime = Math.min(
    tokens?.expiresIn ?? 30 * 24 * 60 * 60,
    30 * 24 * 60 * 60,
  );
  const session: Session = {
    clientKey: client.public.key,
    user: sessionUser(input.email, client.public.key, grantedPermissions),
    expiresAt: new Date(Date.now() + sessionLifetime * 1000).toISOString(),
  };
  await setAuthCookies(session, tokens, input.remember);
  return session;
}

export async function signOut() {
  const client = resolveClient();
  const accessToken = await getClientAccessToken();
  if (client.server.auth.adapter === "ecommerce-api" && accessToken) {
    try {
      await serverApiRequest("/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch {
      // Local cookies must still be cleared if the API token already expired.
    }
  }
  await clearAuthCookies(client.public.key);
}
