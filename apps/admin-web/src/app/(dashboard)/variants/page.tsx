import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { hasPermission } from "@/core/auth/permissions";
import { VariantManagementWorkspace } from "@/features/variant-management/variant-management-workspace";

export default async function VariantsPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const [{ user }, { productId }] = await Promise.all([
    requireModuleAccess("variants", "variants.read"),
    searchParams,
  ]);
  const core = getEcommerceCore();
  const [productsPage, attributePage] = await Promise.all([
    core.catalog.listProducts({ perPage: 100 }),
    core.catalog.listAttributeSets({ perPage: 100 }),
  ]);
  const parent =
    productsPage.items.find((product) => product.id === productId) ??
    productsPage.items[0];
  const variants = parent ? await core.catalog.listVariations(parent.id) : [];

  return (
    <VariantManagementWorkspace
      products={productsPage.items}
      parent={parent}
      variants={variants}
      attributeSets={attributePage.items}
      canManage={hasPermission(user.permissions, "variants.manage")}
    />
  );
}
