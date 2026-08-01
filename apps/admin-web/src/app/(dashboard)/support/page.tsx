import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getSupportInbox } from "@/features/support/api/support.server";
import { SupportInboxWorkspace } from "@/features/support/components/support-inbox-workspace";

export default async function SupportPage() {
  await requireModuleAccess("support", "support.read");
  const view = await getSupportInbox();
  return <SupportInboxWorkspace view={view} />;
}
