import { notFound } from "next/navigation";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { NotFoundError } from "@/core/errors/not-found-error";
import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { getProductRepository, ProductForm } from "@/features/products";
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  await requireModuleAccess("products", "products.update");
  const { productId } = await params;
  let product;
  const repository = getProductRepository();
  try {
    product = await repository.findById(productId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  const core = getEcommerceCore();
  const [categories, brands] = await Promise.all([
    core.catalog.listCategories({ perPage: 100 }),
    core.catalog.listBrands({ perPage: 100 }),
  ]);
  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        title="Edit product"
        description={`Update ${product.name}.`}
      />
      <ProductForm
        product={product}
        categories={categories.items}
        brands={brands.items}
      />
    </PageContainer>
  );
}
