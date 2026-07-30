"use client";
import { createContext, useContext } from "react";
import type { ClientPublicConfig } from "@/clients/client.types";

const ClientConfigContext = createContext<ClientPublicConfig | null>(null);
export function ClientConfigProvider({ client, children }: { client: ClientPublicConfig; children: React.ReactNode }) {
  return <ClientConfigContext value={client}>{children}</ClientConfigContext>;
}
export function useClientConfig() {
  const client = useContext(ClientConfigContext);
  if (!client) throw new Error("useClientConfig must be used inside ClientConfigProvider");
  return client;
}
