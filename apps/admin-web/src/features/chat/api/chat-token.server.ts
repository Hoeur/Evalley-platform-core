import "server-only";
import { createHmac } from "node:crypto";
import { getEnvironment } from "@/core/config/env.server";
import { getSession } from "@/core/auth/session.server";
import type { ChatTokenResponse } from "../chat.types";

/**
 * Token bridge: turn the signed-in evalley agent session into a Chat API
 * access token the browser uses for the socket + REST calls.
 *
 * Resolution order:
 *   A. CHAT_API_SERVICE_KEY  -> POST /auth/service-token (server-to-server).
 *   C. CHAT_API_AGENT_EMAIL + CHAT_API_AGENT_PASSWORD -> log the shared agent
 *      account into the Chat API (auto-registering it when missing) and reuse
 *      the backend-issued access token + user id. No backend change needed.
 *   B. CHAT_API_SHARED_JWT_SECRET + CHAT_API_AGENT_USER_ID -> sign locally.
 *
 * Configure these per client (each client runs with its own env / CLIENT_KEY),
 * so every dashboard replies from its own Chat API support account.
 */

// Cache the minted token per agent email so we do not re-login on every request
// (multiple tabs, window-focus refetches). Refreshed shortly before expiry.
const tokenCache = new Map<string, ChatTokenResponse>();

export async function getChatTokenForCurrentAgent(): Promise<ChatTokenResponse | null> {
  const session = await getSession();
  if (!session) return null;

  const env = getEnvironment();
  const agent = session.user;

  // Option 0 (recommended) — a cg_live_ subscription key. No user credentials:
  // the key resolves to the organization and its owner account on the Chat API,
  // and we trade it for a full agent inbox token via /gateway/agent-session.
  if (env.CHAT_API_SUBSCRIPTION_KEY) {
    return requestAgentSession(
      env.CHAT_API_BASE_URL,
      env.CHAT_API_SUBSCRIPTION_KEY,
      env.CHAT_API_TOKEN_TTL_S,
    );
  }

  // Option A — service-token endpoint.
  if (env.CHAT_API_SERVICE_KEY) {
    return requestServiceToken(env.CHAT_API_BASE_URL, env.CHAT_API_SERVICE_KEY, {
      externalId: agent.id,
      email: agent.email,
      username: agent.name,
    });
  }

  // Option C — log in / auto-register the shared agent account.
  if (env.CHAT_API_AGENT_EMAIL && env.CHAT_API_AGENT_PASSWORD) {
    return loginOrRegisterAgent(env.CHAT_API_BASE_URL, {
      email: env.CHAT_API_AGENT_EMAIL,
      password: env.CHAT_API_AGENT_PASSWORD,
      username:
        env.CHAT_API_AGENT_USERNAME ?? deriveUsername(env.CHAT_API_AGENT_EMAIL),
      autoRegister: env.CHAT_API_AUTO_REGISTER,
      fallbackTtlS: env.CHAT_API_TOKEN_TTL_S,
    });
  }

  // Option B — sign a Chat-API-compatible token locally.
  if (env.CHAT_API_SHARED_JWT_SECRET && env.CHAT_API_AGENT_USER_ID) {
    return signLocalToken(
      env.CHAT_API_SHARED_JWT_SECRET,
      env.CHAT_API_AGENT_USER_ID,
      agent.email,
      agent.name,
      env.CHAT_API_TOKEN_TTL_S,
    );
  }

  throw new Error(
    "Chat token bridge is not configured. Set CHAT_API_AGENT_EMAIL + " +
      "CHAT_API_AGENT_PASSWORD (recommended), CHAT_API_SERVICE_KEY, or " +
      "CHAT_API_SHARED_JWT_SECRET + CHAT_API_AGENT_USER_ID.",
  );
}

interface ChatAuthResponse {
  user: { id: string; email: string; username: string };
  accessToken: string;
}

async function loginOrRegisterAgent(
  baseUrl: string,
  agent: {
    email: string;
    password: string;
    username: string;
    autoRegister: boolean;
    fallbackTtlS: number;
  },
): Promise<ChatTokenResponse> {
  const cached = tokenCache.get(agent.email);
  if (cached && Date.parse(cached.expiresAt) - Date.now() > 30_000) {
    return cached;
  }

  const post = (path: string, body: unknown) =>
    fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

  let response = await post("/auth/login", {
    email: agent.email,
    password: agent.password,
  });

  // No account yet -> register it once, then use the returned token.
  if (
    (response.status === 401 || response.status === 404) &&
    agent.autoRegister
  ) {
    response = await post("/auth/register", {
      email: agent.email,
      username: agent.username,
      password: agent.password,
    });
  }

  if (!response.ok) {
    throw new Error(
      `Chat agent authentication failed (${response.status}). ` +
        "Check CHAT_API_AGENT_EMAIL / CHAT_API_AGENT_PASSWORD.",
    );
  }

  const data = (await response.json()) as ChatAuthResponse;
  const token: ChatTokenResponse = {
    accessToken: data.accessToken,
    chatUserId: data.user.id,
    expiresAt: jwtExpiryIso(data.accessToken, agent.fallbackTtlS),
  };
  tokenCache.set(agent.email, token);
  return token;
}

/** Option 0 — trade a cg_live_ subscription key for a full agent inbox token. */
async function requestAgentSession(
  baseUrl: string,
  subscriptionKey: string,
  fallbackTtlS: number,
): Promise<ChatTokenResponse> {
  const response = await fetch(`${baseUrl}/gateway/agent-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Subscription-Key": subscriptionKey,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(
      `Chat agent-session request failed (${response.status}). ` +
        "Check CHAT_API_SUBSCRIPTION_KEY (a cg_live_… key) and CHAT_API_BASE_URL.",
    );
  }
  const data = (await response.json()) as {
    accessToken: string;
    chatUserId: string;
    organizationId?: string | null;
  };
  return {
    accessToken: data.accessToken,
    chatUserId: data.chatUserId,
    organizationId: data.organizationId ?? null,
    expiresAt: jwtExpiryIso(data.accessToken, fallbackTtlS),
  };
}

async function requestServiceToken(
  baseUrl: string,
  serviceKey: string,
  agent: { externalId: string; email: string; username: string },
): Promise<ChatTokenResponse> {
  const response = await fetch(`${baseUrl}/auth/service-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-service-key": serviceKey,
    },
    body: JSON.stringify(agent),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(
      `Chat service-token request failed with status ${response.status}`,
    );
  }
  return (await response.json()) as ChatTokenResponse;
}

function deriveUsername(email: string) {
  return email.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "") || "support-agent";
}

/** Read the `exp` claim from a JWT (no verification) to know when to refresh. */
function jwtExpiryIso(accessToken: string, fallbackTtlS: number): string {
  try {
    const payload = accessToken.split(".")[1];
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof json.exp === "number") {
      return new Date(json.exp * 1000).toISOString();
    }
  } catch {
    // fall through to the configured fallback
  }
  return new Date(Date.now() + fallbackTtlS * 1000).toISOString();
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

/** Sign an HS256 JWT matching the Chat API's { sub, email, username } payload. */
function signLocalToken(
  secret: string,
  chatUserId: string,
  email: string,
  username: string,
  ttlSeconds: number,
): ChatTokenResponse {
  const issuedAt = Math.floor(Date.now() / 1000);
  const exp = issuedAt + ttlSeconds;
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ sub: chatUserId, email, username, iat: issuedAt, exp }),
  );
  const signature = createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return {
    accessToken: `${header}.${payload}.${signature}`,
    chatUserId,
    expiresAt: new Date(exp * 1000).toISOString(),
  };
}
