import { requireModuleAccess } from "@/core/auth/authorize.server";
import { PromotionsWorkspace } from "@/features/evalley";

export default async function PromotionsPage() { await requireModuleAccess("promotions", "promotions.read"); return <PromotionsWorkspace />; }
