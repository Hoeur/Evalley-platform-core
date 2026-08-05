import { hasPermission } from "@/core/auth/permissions";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { BroadcastsWorkspace } from "@/features/notifications/components/broadcasts-workspace";
import { getBroadcastsData } from "@/features/notifications/api/notifications.server";

export default async function NotificationsPage() {
  const { user } = await requireModuleAccess(
    "notifications",
    "notifications.read",
  );
  const view = await getBroadcastsData();
  return (
    <BroadcastsWorkspace
      view={view}
      canSend={hasPermission(user.permissions, "notifications.manage")}
    />
  );
}
