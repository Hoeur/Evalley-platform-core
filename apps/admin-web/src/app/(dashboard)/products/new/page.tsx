import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { ProductForm } from "@/features/products";
export default async function NewProductPage() {
  await requireModuleAccess("products", "products.create");
  const core = getEcommerceCore();
  const [categories, brands] = await Promise.all([
    core.catalog.listCategories({ perPage: 100 }),
    core.catalog.listBrands({ perPage: 100 }),
  ]);
  return (
    <PageContainer className="max-w-6xl">
      <PageHeader
        title="Add product"
        description="Create a catalog item using the shared product contract."
      />
      <ProductForm categories={categories.items} brands={brands.items} />
    </PageContainer>
  );
}
