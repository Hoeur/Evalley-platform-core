import { permissions, type Permission } from "./permissions";

/**
 * Frontend permission keys the commerce API's RBAC governs. Anything NOT in
 * this set (dashboard, CRM, settings, analytics, rental, etc.) is not driven
 * by the ecommerce `/me/permissions` endpoint and stays granted — otherwise
 * the dashboard and CRM would disappear for every admin (the API has no
 * permission flag for them).
 */
const GOVERNED: readonly Permission[] = [
  "products.read",
  "products.create",
  "products.update",
  "products.delete",
  "variants.read",
  "variants.manage",
  "attributes.read",
  "attributes.manage",
  "inventory.read",
  "inventory.manage",
  "categories.read",
  "categories.manage",
  "reviews.read",
  "reviews.manage",
  "orders.read",
  "orders.update",
  "content.read",
  "content.manage",
  "users.read",
  "users.manage",
  "roles.read",
  "roles.manage",
  "notifications.read",
  "notifications.manage",
];

/** commerce API permission flag → frontend permission key(s). */
const FLAG_MAP: Record<string, readonly Permission[]> = {
  "catalog.products.view": ["products.read", "variants.read", "attributes.read"],
  "catalog.products.create": ["products.create"],
  "catalog.products.update": ["products.update", "variants.manage"],
  "catalog.products.delete": ["products.delete"],
  "catalog.categories.view": ["categories.read"],
  "catalog.categories.create": ["categories.manage"],
  "catalog.categories.update": ["categories.manage"],
  "catalog.categories.delete": ["categories.manage"],
  "catalog.brands.view": ["categories.read"],
  "catalog.brands.create": ["categories.manage"],
  "catalog.brands.update": ["categories.manage"],
  "catalog.brands.delete": ["categories.manage"],
  "catalog.attribute_sets.view": ["attributes.read"],
  "catalog.attribute_sets.create": ["attributes.manage"],
  "catalog.attribute_sets.update": ["attributes.manage"],
  "catalog.attribute_sets.delete": ["attributes.manage"],
  "inventory.stock.view": ["inventory.read"],
  "inventory.stock.adjust": ["inventory.manage"],
  "customer.reviews.view": ["reviews.read"],
  "customer.reviews.moderate": ["reviews.manage"],
  "orders.view": ["orders.read"],
  "orders.update_status": ["orders.update"],
  "orders.mark_paid": ["orders.update"],
  "orders.refund": ["orders.update"],
  "cms.banners.view": ["content.read"],
  "cms.pages.view": ["content.read"],
  "cms.footer_links.view": ["content.read"],
  "cms.footer_socials.view": ["content.read"],
  "cms.footer_settings.view": ["content.read"],
  "cms.banners.create": ["content.manage"],
  "cms.banners.update": ["content.manage"],
  "cms.banners.delete": ["content.manage"],
  "cms.pages.create": ["content.manage"],
  "cms.pages.update": ["content.manage"],
  "cms.pages.delete": ["content.manage"],
  "cms.footer_links.create": ["content.manage"],
  "cms.footer_links.update": ["content.manage"],
  "cms.footer_links.delete": ["content.manage"],
  "cms.footer_socials.create": ["content.manage"],
  "cms.footer_socials.update": ["content.manage"],
  "cms.footer_socials.delete": ["content.manage"],
  "cms.footer_settings.update": ["content.manage"],
  "admins.view": ["users.read"],
  "admins.create": ["users.manage"],
  "admins.update": ["users.manage"],
  "admins.delete": ["users.manage"],
  "roles.view": ["roles.read"],
  "roles.create": ["roles.manage"],
  "roles.update": ["roles.manage"],
  "roles.delete": ["roles.manage"],
  "notifications.broadcast.view": ["notifications.read"],
  "notifications.broadcast.send": ["notifications.manage"],
};

/**
 * Turn the admin's granted commerce API flags into the frontend permission
 * set: everything the API doesn't govern stays granted, plus the governed
 * keys the admin actually has.
 */
export function resolveSessionPermissions(
  flags: readonly string[],
): Permission[] {
  const governed = new Set<Permission>(GOVERNED);
  const result = new Set<Permission>(
    permissions.filter((permission) => !governed.has(permission)),
  );
  for (const flag of flags) {
    for (const mapped of FLAG_MAP[flag] ?? []) result.add(mapped);
  }
  return [...result];
}
