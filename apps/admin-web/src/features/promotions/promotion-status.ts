import type {
  Promotion,
  PromotionDiscountType,
  PromotionStatus,
} from "@platform/ecommerce-core";

/** Client-safe helpers + view models for the promotions admin screen. */

export const promoCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export type PromotionsView = {
  readonly promotions: readonly Promotion[];
  readonly total: number;
};

export function promoStatusVariant(
  status: PromotionStatus,
): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (status) {
    case "active":
      return "success";
    case "scheduled":
      return "info";
    case "paused":
      return "warning";
    case "expired":
      return "danger";
    default:
      return "neutral"; // draft
  }
}

export function discountLabel(p: {
  discountType: PromotionDiscountType;
  discountValue: number | null;
}): string {
  if (p.discountType === "free_shipping") return "Free shipping";
  if (p.discountType === "percentage") return `${p.discountValue ?? 0}% off`;
  return `${promoCurrency.format(p.discountValue ?? 0)} off`;
}

export function promoName(p: Promotion): string {
  const t = p.translations.en ?? Object.values(p.translations)[0];
  return t?.name ?? p.slug ?? p.code ?? `Promotion ${p.id}`;
}

export function scheduleLabel(p: Promotion): string {
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (p.startsAt && p.endsAt) return `${fmt(p.startsAt)} – ${fmt(p.endsAt)}`;
  if (p.startsAt) return `From ${fmt(p.startsAt)}`;
  if (p.endsAt) return `Until ${fmt(p.endsAt)}`;
  return "No schedule";
}
