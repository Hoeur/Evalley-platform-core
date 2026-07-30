import { Truck } from "lucide-react";
import { ProtectedModulePage } from "@/features/shared/protected-module-page";

export default function ShippingPage() {
  return <ProtectedModulePage module="shipping" permission="shipping.read" title="Shipping" description="Configure delivery zones, carriers, rates, and fulfillment operations." icon={Truck} />;
}
