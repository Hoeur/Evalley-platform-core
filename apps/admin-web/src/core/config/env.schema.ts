import { z } from "zod";

/** Optional string env var where a blank value ("") is treated as unset. */
const optionalSecret = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

export const envSchema = z.object({
  CLIENT_KEY: z.string().trim().min(1).default("evalley"),
  API_BASE_URL: z.url().default("http://127.0.0.1:8000/api/v1/admin"),
  API_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  ECOMMERCE_API_TOKEN: z.string().trim().min(1).optional(),
  CRM_API_BASE_URL: z.url().default("http://127.0.0.1:3100/api/v1"),
  CRM_API_TOKEN: z.string().trim().min(1).optional(),
  CRM_API_EMAIL: z.email().optional(),
  CRM_API_PASSWORD: z.string().min(12).optional(),
  CRM_API_TENANT_SLUG: z.string().trim().min(1).optional(),
  AUTH_SESSION_SECRET: z
    .string()
    .min(32)
    .default("evalley-local-session-secret-change-me"),
  AUTH_MOCK_EMAIL: z.email().optional(),
  AUTH_MOCK_PASSWORD: z.string().min(8).optional(),
  AUTH_MODE: z.enum(["mock", "cookie"]).default("mock"),
  /**
   * Force the Secure flag on auth cookies. Leave unset to follow NODE_ENV
   * (secure in production). Set to "false" when serving a production build
   * over plain HTTP (e.g. a LAN IP) so the browser will actually store the
   * session cookie. Prefer HTTPS in real production and leave this unset.
   */
  AUTH_COOKIE_SECURE: z
    .string()
    .optional()
    .transform((value) =>
      value === undefined || value.trim() === ""
        ? undefined
        : value.trim() !== "false",
    ),

  // --- Chat core module (support chat over the NestJS Chat API) ---
  /** Server-side base URL for the Chat API REST + service-token endpoint. */
  CHAT_API_BASE_URL: z.url().default("http://localhost:3001/api"),
  /**
   * Option 0 (recommended): a cg_live_… subscription key. The dashboard trades
   * it for a full agent inbox token via POST /gateway/agent-session — no user
   * email/password anywhere, and the key already carries the organization. Keep
   * it server-side only.
   */
  CHAT_API_SUBSCRIPTION_KEY: optionalSecret,
  /**
   * Shared service key the admin server uses to mint a Chat API access token
   * for the signed-in agent (Option A token bridge). When absent, the token
   * bridge falls back to CHAT_API_SHARED_JWT_SECRET (Option B) if present.
   */
  CHAT_API_SERVICE_KEY: optionalSecret,
  /**
   * Option C (recommended default): the shared Chat API support account the
   * dashboard logs in as. Auto-registered on first use when missing.
   */
  CHAT_API_AGENT_EMAIL: optionalSecret,
  CHAT_API_AGENT_PASSWORD: optionalSecret,
  CHAT_API_AGENT_USERNAME: optionalSecret,
  /** Register the agent account if login returns 401/404 (default true). */
  CHAT_API_AUTO_REGISTER: z
    .string()
    .optional()
    .transform((value) => value !== "false"),
  /** Fallback: sign a Chat-API-compatible JWT directly (Option B). */
  CHAT_API_SHARED_JWT_SECRET: optionalSecret,
  /** Access-token lifetime (seconds) for Option B signed tokens. */
  CHAT_API_TOKEN_TTL_S: z.coerce.number().int().positive().default(900),
  /**
   * Dev fallback (Option B): the Chat API user id the agent acts as when
   * signing tokens locally with CHAT_API_SHARED_JWT_SECRET. Typically a single
   * shared merchant/support account until the service-token endpoint lands.
   */
  CHAT_API_AGENT_USER_ID: optionalSecret,
});

export type AppEnvironment = z.infer<typeof envSchema>;
