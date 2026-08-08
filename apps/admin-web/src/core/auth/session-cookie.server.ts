import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { resolveClient } from "@/clients/client-resolver.server";
import { getEnvironment } from "@/core/config/env.server";
import { permissions, type Permission } from "./permissions";
import type { Session } from "./session.types";

/**
 * The signed session lives in a cookie, so it must stay well under the browser
 * ~4KB per-cookie limit. Serialising the whole permission list (all ecommerce
 * + CRM permissions) blew past that limit, so the browser silently dropped the
 * session cookie and bounced the user to /login on every navigation. We store
 * permissions as a compact bitmask over the canonical `permissions` order and
 * expand it back on read, keeping per-admin RBAC subsets intact.
 */
const wireSchema = z.object({
  clientKey: z.string().min(1),
  user: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    email: z.email(),
    role: z.enum(["owner", "admin", "manager", "viewer"]),
    p: z.string(),
  }),
  expiresAt: z.iso.datetime(),
});

export type AuthTokens = {
  readonly accessToken: string;
  readonly refreshToken: string | null;
  readonly expiresIn: number;
};

export function authCookieNames(clientKey: string) {
  return {
    session: `admin-session-${clientKey}`,
    accessToken: `admin-access-${clientKey}`,
    refreshToken: `admin-refresh-${clientKey}`,
  };
}

function signature(payload: string) {
  return createHmac("sha256", getEnvironment().AUTH_SESSION_SECRET)
    .update(payload)
    .digest("base64url");
}

function encodePermissionBits(granted: readonly Permission[]): string {
  const set = new Set<Permission>(granted);
  const bytes = new Uint8Array(Math.ceil(permissions.length / 8));
  permissions.forEach((perm, index) => {
    if (set.has(perm)) bytes[index >> 3] |= 1 << (index & 7);
  });
  return Buffer.from(bytes).toString("base64url");
}

function decodePermissionBits(encoded: string): Permission[] {
  const bytes = Buffer.from(encoded, "base64url");
  const granted: Permission[] = [];
  permissions.forEach((perm, index) => {
    if (((bytes[index >> 3] ?? 0) >> (index & 7)) & 1) granted.push(perm);
  });
  return granted;
}

function encodeSession(session: Session) {
  const wire = {
    clientKey: session.clientKey,
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      p: encodePermissionBits(session.user.permissions),
    },
    expiresAt: session.expiresAt,
  };
  const payload = Buffer.from(JSON.stringify(wire)).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

function decodeSession(value: string): Session | null {
  const separator = value.lastIndexOf(".");
  if (separator < 1) return null;
  const payload = value.slice(0, separator);
  const receivedSignature = value.slice(separator + 1);
  const expectedSignature = signature(payload);
  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);
  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    return null;
  }
  try {
    const wire = wireSchema.parse(
      JSON.parse(Buffer.from(payload, "base64url").toString("utf8")),
    );
    return {
      clientKey: wire.clientKey,
      user: {
        id: wire.user.id,
        name: wire.user.name,
        email: wire.user.email,
        role: wire.user.role,
        permissions: decodePermissionBits(wire.user.p),
      },
      expiresAt: wire.expiresAt,
    };
  } catch {
    return null;
  }
}

function cookieOptions(remember: boolean, maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure:
      getEnvironment().AUTH_COOKIE_SECURE ??
      process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge } : {}),
  };
}

export async function setAuthCookies(
  session: Session,
  tokens: AuthTokens | null,
  remember: boolean,
) {
  const cookieStore = await cookies();
  const names = authCookieNames(session.clientKey);
  const maxAge = Math.max(
    60,
    Math.min(tokens?.expiresIn ?? 30 * 24 * 60 * 60, 30 * 24 * 60 * 60),
  );
  const options = cookieOptions(remember, maxAge);
  const encoded = encodeSession(session);
  console.warn(`[auth] session cookie bytes=${encoded.length} (browser cap ~4096)`);
  cookieStore.set(names.session, encoded, options);
  if (tokens) {
    cookieStore.set(names.accessToken, tokens.accessToken, options);
    if (tokens.refreshToken) {
      cookieStore.set(names.refreshToken, tokens.refreshToken, options);
    }
  }
}

export async function clearAuthCookies(clientKey = resolveClient().public.key) {
  const cookieStore = await cookies();
  const names = authCookieNames(clientKey);
  cookieStore.delete(names.session);
  cookieStore.delete(names.accessToken);
  cookieStore.delete(names.refreshToken);
}

export async function readSignedSession(): Promise<Session | null> {
  const client = resolveClient();
  const cookieStore = await cookies();
  const names = authCookieNames(client.public.key);
  const raw = cookieStore.get(names.session)?.value;
  if (!raw) return null;
  const session = decodeSession(raw);
  if (
    !session ||
    session.clientKey !== client.public.key ||
    Date.parse(session.expiresAt) <= Date.now()
  ) {
    return null;
  }
  if (
    client.server.auth.adapter === "ecommerce-api" &&
    !cookieStore.get(names.accessToken)?.value
  ) {
    return null;
  }
  return session;
}

export async function getClientAccessToken() {
  const clientKey = resolveClient().public.key;
  return (await cookies()).get(authCookieNames(clientKey).accessToken)?.value;
}
