import type { ClientPublicConfig } from "@/clients/client.types";
import type { SessionUser } from "@/core/auth/session.types";
import type { NavigationGroup } from "@/modules/module.types";
export type DashboardLayoutProps = { children: React.ReactNode; navigation: NavigationGroup[]; client: ClientPublicConfig; user: SessionUser };
