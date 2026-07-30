import { cookies } from "next/headers";
import { resolveClient } from "@/clients/client-resolver.server";
import { requireSession } from "@/core/auth/session.server";
import { DashboardShell } from "@/layouts/dashboard-shell";
import { buildNavigation } from "@/modules/navigation-builder";
import { getEnabledModules } from "@/modules/enabled-modules.server";
import type { LayoutType } from "@/clients/client.types";

export default async function DashboardRouteLayout({ children }: { children: React.ReactNode }) {
  const client = resolveClient().public;
  const [{ user }, cookieStore, enabledModules] = await Promise.all([
    requireSession(),
    cookies(),
    getEnabledModules(client),
  ]);
  const requested = cookieStore.get(`dashboard-layout-${client.key}`)?.value as LayoutType | undefined;
  const layout = client.features.layoutSwitcher && requested && client.layout.allowedTypes.includes(requested)
    ? requested
    : client.layout.defaultType;
  const navigation = buildNavigation(enabledModules, user.permissions);

  return <DashboardShell layout={layout} client={client} user={user} navigation={navigation}>{children}</DashboardShell>;
}
