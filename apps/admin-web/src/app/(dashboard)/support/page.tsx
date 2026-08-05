import { requireModuleAccess } from "@/core/auth/authorize.server";
import { SupportChatWorkspace } from "@/features/support/components/support-chat-workspace";

export default async function SupportPage() {
  await requireModuleAccess("support", "support.read");
  return <SupportChatWorkspace />;
}
