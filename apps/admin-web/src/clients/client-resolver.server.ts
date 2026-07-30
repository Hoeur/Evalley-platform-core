import "server-only";
import { getEnvironment } from "@/core/config/env.server";
import { getRegisteredClient } from "./client-registry";

export function resolveClient() {
  const env = getEnvironment();
  const registered = getRegisteredClient(env.CLIENT_KEY);
  return {
    public: registered.public,
    server: {
      api: {
        ...registered.server.api,
        baseUrl: env.API_BASE_URL,
        timeoutMs: env.API_TIMEOUT_MS,
      },
      auth: {
        adapter:
          env.AUTH_MODE === "mock" ? "mock" : registered.server.auth.adapter,
      },
    },
  };
}
