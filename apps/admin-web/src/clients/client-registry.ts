import { clientConfigSchema } from "./client.schema";
import { defaultClient } from "./default.client";
import { groceryClient } from "./grocery.client";
import { evalleyClient } from "./evalley.client";
import { rentHouseClient } from "./renthouse.client";
import type { ClientConfig } from "./client.types";

export const clientRegistry = {
  default: clientConfigSchema.parse(defaultClient) as ClientConfig,
  evalley: clientConfigSchema.parse(evalleyClient) as ClientConfig,
  grocery: clientConfigSchema.parse(groceryClient) as ClientConfig,
  renthouse: clientConfigSchema.parse(rentHouseClient) as ClientConfig,
};

export type ClientKey = keyof typeof clientRegistry;

export function getRegisteredClient(key: string) {
  const client = clientRegistry[key as ClientKey];
  if (!client) throw new Error(`Unknown CLIENT_KEY "${key}". Registered clients: ${Object.keys(clientRegistry).join(", ")}`);
  return client;
}
