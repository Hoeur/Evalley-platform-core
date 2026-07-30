import { Building2 } from "lucide-react";
import { ProtectedModulePage } from "@/features/shared/protected-module-page";

export default function PropertiesPage() {
  return <ProtectedModulePage module="properties" permission="properties.read" title="Properties" description="Manage rental properties, units, amenities, availability, and listings." icon={Building2} />;
}
