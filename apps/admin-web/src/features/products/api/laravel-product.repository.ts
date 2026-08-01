import "server-only";
import type {
  Category,
  InventoryItem,
  InventoryStatus,
  Product as CommerceProduct,
  ProductQuery,
  PublishStatus,
} from "@platform/ecommerce-core";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import type { PaginatedResult } from "@/core/utils/pagination";
import type {
  CreateProductInput,
  Product,
  ProductCatalogSummary,
  ProductListFilters,
  ProductSort,
  ProductStockFilter,
  UpdateProductInput,
} from "../types/product.types";
import type { ProductRepository } from "./product.repository";

function publishStatus(status: Product["status"]): PublishStatus {
  if (status === "active") return "published";
  if (status === "draft") return "draft";
  throw new Error(
    `Product status "${status}" is not supported by core-ecommerce-api.`,
  );
}

function categoryMap(categories: readonly Category[]) {
  return new Map(categories.map((category) => [category.id, category.name]));
}

function productInventoryStatus(
  inventory?: InventoryItem,
): Product["inventoryStatus"] {
  if (inventory?.status === "in_stock") return "in-stock";
  if (inventory?.status === "low_stock") return "low-stock";
  if (inventory?.status === "backorder") return "backorder";
  return "out-of-stock";
}

function toProduct(
  product: CommerceProduct,
  categories: Map<string, string>,
  inventory?: InventoryItem,
): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? undefined,
    translations: product.translations,
    sku: product.sku,
    barcode: product.barcode ?? undefined,
    slug: product.slug,
    brandId: product.brandId ?? undefined,
    imageUrl: product.thumbnailUrl ?? undefined,
    imageUrls: [...product.imageUrls],
    images: (product.images ?? []).map((image) => ({
      id: image.id,
      url: image.url,
    })),
    categoryIds: [...product.categoryIds],
    categoryName: product.categoryIds
      .map((id) => categories.get(id))
      .find(Boolean),
    price: product.price,
    salePrice: product.salePrice ?? undefined,
    saleStartsAt: product.saleStartsAt ?? undefined,
    saleEndsAt: product.saleEndsAt ?? undefined,
    featured: product.featured,
    order: product.order,
    weight: product.weight ?? undefined,
    length: product.length ?? undefined,
    width: product.width ?? undefined,
    height: product.height ?? undefined,
    stock: inventory?.onHand ?? 0,
    inventoryStatus: productInventoryStatus(inventory),
    status: product.status === "published" ? "active" : "draft",
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

async function resolveCategoryId(name?: string) {
  if (!name) return undefined;
  const categories = await getEcommerceCore().catalog.listCategories({
    perPage: 100,
  });
  const normalized = name.trim().toLowerCase();
  const category = categories.items.find(
    (item) => item.name.trim().toLowerCase() === normalized,
  );
  if (!category) {
    throw new Error(`Category "${name}" does not exist in the commerce API.`);
  }
  return category.id;
}

async function setStock(productId: string, desiredStock: number) {
  const inventory = await getEcommerceCore().inventory.get(productId);
  const delta = desiredStock - inventory.onHand;
  if (delta === 0) return inventory;
  return getEcommerceCore().inventory.applyMovement(productId, {
    delta,
    reason: "manual_adjustment",
    note: "Adjusted from Evalley admin product form.",
    referenceKey: `admin-product-${productId}-${Date.now()}`,
  });
}

function catalogSort(sort: Exclude<ProductSort, "stock.asc">) {
  const [field, direction] = sort.split(".") as [
    "createdAt" | "name" | "price",
    "asc" | "desc",
  ];
  return {
    sortBy: field === "createdAt" ? ("created_at" as const) : field,
    sortDirection: direction,
  };
}

function inventoryStatus(
  stock?: ProductStockFilter,
): InventoryStatus | undefined {
  if (stock === "in-stock") return "in_stock";
  if (stock === "low-stock") return "low_stock";
  if (stock === "out-of-stock") return "out_of_stock";
  return undefined;
}

function productQuery(
  filters: ProductListFilters,
  categoryId?: string,
): ProductQuery {
  const sort =
    filters.sort === "stock.asc" ? undefined : catalogSort(filters.sort);
  return {
    page: filters.page,
    perPage: filters.limit,
    search: filters.search,
    status: filters.status ? publishStatus(filters.status) : undefined,
    categoryId,
    ...sort,
  };
}

async function getCategories() {
  const page = await getEcommerceCore().catalog.listCategories({
    perPage: 100,
  });
  return categoryMap(page.items);
}

export const laravelProductRepository: ProductRepository = {
  async list(filters): Promise<PaginatedResult<Product>> {
    const core = getEcommerceCore();
    const categoryId = await resolveCategoryId(filters.category);
    const categoriesPromise = getCategories();

    if (filters.stock || filters.sort === "stock.asc") {
      const productSort =
        filters.sort === "stock.asc" ? undefined : catalogSort(filters.sort);
      const [page, categories] = await Promise.all([
        core.inventory.list({
          page: filters.page,
          perPage: filters.limit,
          status: inventoryStatus(filters.stock),
          keyword: filters.search,
          categoryId,
          productStatus: filters.status
            ? publishStatus(filters.status)
            : undefined,
          includeVariations: false,
          productSortBy: productSort?.sortBy,
          productSortDirection: productSort?.sortDirection,
          sortBy: filters.sort === "stock.asc" ? "quantity_on_hand" : undefined,
          sortDirection: filters.sort === "stock.asc" ? "asc" : undefined,
        }),
        categoriesPromise,
      ]);
      const products = await Promise.all(
        page.items.map((inventory) =>
          core.catalog.getProduct(inventory.productId),
        ),
      );
      return {
        items: products.map((product, index) =>
          toProduct(product, categories, page.items[index]),
        ),
        page: page.page,
        limit: page.perPage,
        total: page.total,
        pageCount: Math.max(1, page.lastPage),
      };
    }

    const [page, categories] = await Promise.all([
      core.catalog.listProducts(productQuery(filters, categoryId)),
      categoriesPromise,
    ]);
    const inventory = await Promise.all(
      page.items.map((product) => core.inventory.get(product.id)),
    );
    return {
      items: page.items.map((product, index) =>
        toProduct(product, categories, inventory[index]),
      ),
      page: page.page,
      limit: page.perPage,
      total: page.total,
      pageCount: Math.max(1, page.lastPage),
    };
  },

  async summary(): Promise<ProductCatalogSummary> {
    const core = getEcommerceCore();
    const [all, published, drafts, inventory, categories] = await Promise.all([
      core.catalog.listProducts({ perPage: 1 }),
      core.catalog.listProducts({ perPage: 1, status: "published" }),
      core.catalog.listProducts({ perPage: 1, status: "draft" }),
      core.inventory.metrics(),
      core.catalog.listCategories({ perPage: 100 }),
    ]);
    return {
      total: all.total,
      active: published.total,
      drafts: drafts.total,
      lowStock: inventory.lowStockCount,
      categories: categories.items.map((category) => category.name).sort(),
    };
  },

  async findById(id) {
    const core = getEcommerceCore();
    const [product, categories, inventory] = await Promise.all([
      core.catalog.getProduct(id),
      getCategories(),
      core.inventory.get(id),
    ]);
    return toProduct(product, categories, inventory);
  },

  async create(input: CreateProductInput) {
    const product = await getEcommerceCore().catalog.createProduct({
      name: input.name,
      description: input.description ?? null,
      sku: input.sku,
      barcode: input.barcode ?? null,
      slug: input.slug ?? null,
      brandId: input.brandId ?? null,
      status: publishStatus(input.status),
      featured: input.featured,
      order: input.order,
      price: input.price,
      salePrice: input.salePrice ?? null,
      saleStartsAt: input.saleStartsAt ?? null,
      saleEndsAt: input.saleEndsAt ?? null,
      weight: input.weight ?? null,
      length: input.length ?? null,
      width: input.width ?? null,
      height: input.height ?? null,
      categoryIds: input.categoryIds ?? [],
      translations: input.translations,
    });
    const inventory = await setStock(product.id, input.stock);
    return toProduct(product, await getCategories(), inventory);
  },

  async update(id: string, input: UpdateProductInput) {
    const product = await getEcommerceCore().catalog.updateProduct(id, {
      name: input.name,
      description: input.description ?? null,
      sku: input.sku,
      barcode: input.barcode ?? null,
      slug: input.slug ?? null,
      brandId: input.brandId ?? null,
      status: input.status ? publishStatus(input.status) : undefined,
      featured: input.featured,
      order: input.order,
      price: input.price,
      salePrice: input.salePrice ?? null,
      saleStartsAt: input.saleStartsAt ?? null,
      saleEndsAt: input.saleEndsAt ?? null,
      weight: input.weight ?? null,
      length: input.length ?? null,
      width: input.width ?? null,
      height: input.height ?? null,
      categoryIds: input.categoryIds,
      translations: input.translations,
    });
    const inventory =
      input.stock === undefined
        ? await getEcommerceCore().inventory.get(id)
        : await setStock(id, input.stock);
    return toProduct(product, await getCategories(), inventory);
  },

  async remove(id) {
    await getEcommerceCore().catalog.deleteProduct(id);
  },
};
