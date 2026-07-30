import { FileSignature } from "lucide-react";
import { ProtectedModulePage } from "@/features/shared/protected-module-page";

export default function LeasesPage() {
  return <ProtectedModulePage module="leases" permission="leases.read" title="Leases" description="Track lease agreements, renewals, deposits, and contract milestones." icon={FileSignature} />;
}
