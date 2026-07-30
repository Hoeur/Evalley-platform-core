import "server-only";
import { envSchema, type AppEnvironment } from "./env.schema";

let cachedEnvironment: AppEnvironment | undefined;

export function getEnvironment(): AppEnvironment {
  cachedEnvironment ??= envSchema.parse(process.env);
  return cachedEnvironment;
}
