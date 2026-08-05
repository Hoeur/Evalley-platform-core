import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { resolveClient } from "@/clients/client-resolver.server";
import { getEnvironment } from "@/core/config/env.server";
import { permissions } from "./permissions";
import type { Session } from "./session.types";

const sessionSchema = z.object({
  clientKey: z.string().min(1),
  user: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    email: z.email(),
    role: z.enum(["owner", "admin", "manager", "viewer"]),
    permissions: z.array(z.enum(permissions)),
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

function encodeSession(session: Session) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
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
  )
    return null;
  try {
    return sessionSchema.parse(
      JSON.parse(Buffer.from(payload, "base64url").toString("utf8")),
    ) as Session;
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
  cookieStore.set(names.session, encodeSession(session), options);
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
