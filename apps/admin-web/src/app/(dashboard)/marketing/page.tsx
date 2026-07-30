import { BarChart3 } from "lucide-react";
import { ProtectedModulePage } from "@/features/shared/protected-module-page";

export default function MarketingPage() {
  return <ProtectedModulePage module="marketing" permission="marketing.read" title="Marketing" description="Plan campaigns, audiences, acquisition channels, and performance." icon={BarChart3} />;
}
