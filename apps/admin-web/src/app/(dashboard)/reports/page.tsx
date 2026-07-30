import { ChartNoAxesCombined } from "lucide-react";
import { ProtectedModulePage } from "@/features/shared/protected-module-page";

export default function ReportsPage() {
  return <ProtectedModulePage module="reports" permission="reports.read" title="Reports" description="Review operational, financial, and customer performance insights." icon={ChartNoAxesCombined} />;
}
