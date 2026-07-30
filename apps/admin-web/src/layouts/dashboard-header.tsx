import type { ClientPublicConfig } from "@/clients/client.types";
import type { SessionUser } from "@/core/auth/session.types";
import type { NavigationGroup } from "@/modules/module.types";
import { DashboardHeaderContent } from "./dashboard-header-content";

export function DashboardHeader({
  client,
  user,
  navigation,
}: {
  client: ClientPublicConfig;
  user: SessionUser;
  navigation: NavigationGroup[];
  appearance?: "default" | "brand";
}) {
  const groups = navigation.map((group) => ({
    label: group.label,
    items: group.items.map(({ key, label, href, icon: Icon, badge }) => ({
      key,
      label,
      href,
      icon: <Icon className="size-[18px] shrink-0" />,
      badge,
    })),
  }));
  return <DashboardHeaderContent client={client} user={user} groups={groups} />;
}
