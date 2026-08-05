export const ecommerceModuleKeys = [
  "analytics",
  "products",
  "variants",
  "attributes",
  "inventory",
  "categories",
  "promotions",
  "reviews",
  "orders",
  "returns",
  "shipments",
  "customers",
  "vendors",
  "withdrawals",
  "ledger",
  "marketing",
  "shipping",
  "reports",
  "notifications",
] as const;

export type EcommerceModuleKey = (typeof ecommerceModuleKeys)[number];
export type EcommerceCapabilityStatus = "available" | "backend-required";

export type EcommerceModuleCapability = {
  readonly status: EcommerceCapabilityStatus;
  readonly reason?: string;
};

export const ecommerceModuleCapabilities = {
  analytics: {
    status: "backend-required",
    reason: "The commerce API has no admin analytics aggregate endpoint.",
  },
  products: { status: "available" },
  variants: { status: "available" },
  attributes: { status: "available" },
  inventory: { status: "available" },
  categories: { status: "available" },
  promotions: { status: "available" },
  reviews: { status: "available" },
  orders: { status: "available" },
  returns: {
    status: "backend-required",
    reason: "Return merchandise authorization endpoints are not implemented.",
  },
  shipments: {
    status: "backend-required",
    reason: "Shipment and tracking endpoints are not implemented.",
  },
  customers: { status: "available" },
  vendors: { status: "available" },
  withdrawals: { status: "available" },
  ledger: { status: "available" },
  marketing: {
    status: "backend-required",
    reason: "Commerce marketing endpoints are not implemented.",
  },
  shipping: {
    status: "backend-required",
    reason: "Shipping configuration endpoints are not implemented.",
  },
  reports: {
    status: "backend-required",
    reason: "Commerce reporting aggregates are not implemented.",
  },
  notifications: { status: "available" },
} satisfies Record<EcommerceModuleKey, EcommerceModuleCapability>;

export function isEcommerceModuleKey(
  value: string,
): value is EcommerceModuleKey {
  return ecommerceModuleKeys.includes(value as EcommerceModuleKey);
}
