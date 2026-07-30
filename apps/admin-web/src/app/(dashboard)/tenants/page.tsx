import { UsersRound } from "lucide-react";
import { ProtectedModulePage } from "@/features/shared/protected-module-page";

export default function TenantsPage() {
  return <ProtectedModulePage module="tenants" permission="tenants.read" title="Tenants" description="Maintain tenant profiles, applications, documents, and communication." icon={UsersRound} />;
}
