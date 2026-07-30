import { requireModuleAccess } from "@/core/auth/authorize.server";
import { SettingsWorkspace } from "@/features/evalley";

export default async function SettingsPage() { await requireModuleAccess("settings", "settings.read"); return <SettingsWorkspace />; }
