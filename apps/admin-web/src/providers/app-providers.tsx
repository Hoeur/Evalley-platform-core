"use client";
import type { ClientPublicConfig } from "@/clients/client.types";
import { TooltipProvider } from "@/design-system/ui/tooltip";
import { Toaster } from "@/design-system/ui/sonner";
import { ClientConfigProvider } from "./client-config-provider";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

export function AppProviders({ client, children }: { client: ClientPublicConfig; children: React.ReactNode }) {
  return <ClientConfigProvider client={client}><ThemeProvider><QueryProvider><TooltipProvider>{children}<Toaster richColors /></TooltipProvider></QueryProvider></ThemeProvider></ClientConfigProvider>;
}
