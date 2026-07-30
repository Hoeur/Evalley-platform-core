import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { hasPermission } from "@/core/auth/permissions";
import { CatalogManagementWorkspace } from "@/features/catalog-management/catalog-management-workspace";

export default async function CategoriesPage() {
  const { user } = await requireModuleAccess("categories", "categories.read");
  const core = getEcommerceCore();
  const [categories, brands] = await Promise.all([
    core.catalog.listCategories({ perPage: 100 }),
    core.catalog.listBrands({ perPage: 100 }),
  ]);

  return (
    <CatalogManagementWorkspace
      categories={categories.items}
      brands={brands.items}
      canManage={hasPermission(user.permissions, "categories.manage")}
    />
  );
}
