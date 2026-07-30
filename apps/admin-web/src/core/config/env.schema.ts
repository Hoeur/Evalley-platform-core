import { z } from "zod";

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
});

export type AppEnvironment = z.infer<typeof envSchema>;
