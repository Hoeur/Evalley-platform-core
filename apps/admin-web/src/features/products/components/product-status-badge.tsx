import { StatusBadge } from "@/components/status/status-badge";
import type { ProductStatus } from "../types/product.types";
const variants: Record<
  ProductStatus,
  "success" | "warning" | "danger" | "neutral"
> = { active: "success", draft: "warning" };
export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return <StatusBadge variant={variants[status]}>{status}</StatusBadge>;
}
