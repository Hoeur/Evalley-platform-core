import { Wrench } from "lucide-react";
import { ProtectedModulePage } from "@/features/shared/protected-module-page";

export default function MaintenancePage() {
  return <ProtectedModulePage module="maintenance" permission="maintenance.read" title="Maintenance" description="Triage service requests, assign work, and track property repairs." icon={Wrench} />;
}
