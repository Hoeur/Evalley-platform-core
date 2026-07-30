import "server-only";
import type { AttributeSet, Review } from "@platform/ecommerce-core";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import type { ReviewView, WorkspaceConfig } from "../types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function apiConfig(config: WorkspaceConfig): WorkspaceConfig {
  return { ...config, readOnly: true, sourceLabel: "core-ecommerce-api" };
}

export async function getInventoryWorkspace(): Promise<WorkspaceConfig> {
  const core = getEcommerceCore();
  const [page, metrics] = await Promise.all([
    core.inventory.list({ perPage: 100 }),
    core.inventory.metrics(),
  ]);
  return apiConfig({
    title: "Inventory",
    description: "Store-wide stock levels and reservations from the commerce API.",
    primaryAction: "Stock adjustment",
    searchPlaceholder: "Search product or SKU...",
    metrics: [
      { label: "Catalog units", value: String(metrics.totalOnHand) },
      { label: "Reserved", value: String(metrics.totalReserved) },
      { label: "Available", value: String(metrics.totalAvailable) },
      {
        label: "Stock alerts",
        value: String(metrics.lowStockCount + metrics.outOfStockCount),
        change: "Action required",
      },
    ],
    columns: [
      { key: "product", label: "Product" },
      { key: "sku", label: "SKU", format: "mono" },
      { key: "onHand", label: "On hand", align: "right" },
      { key: "reserved", label: "Reserved", align: "right" },
      { key: "available", label: "Available", align: "right" },
      { key: "status", label: "Status", format: "status" },
    ],
    rows: page.items.map((item) => ({
      id: item.productId,
      product: item.productName ?? `Product #${item.productId}`,
      sku: item.sku ?? "—",
      onHand: item.onHand,
      reserved: item.reserved,
      available: item.available,
      status: item.status.replaceAll("_", " "),
    })),
  });
}

export async function getOrdersWorkspace(): Promise<WorkspaceConfig> {
  const page = await getEcommerceCore().orders.list({ perPage: 100 });
  return apiConfig({
    title: "Orders",
    description: `${page.total} orders returned by the commerce API.`,
    primaryAction: "Create order",
    searchPlaceholder: "Search order or customer ID...",
    metrics: [
      { label: "Total orders", value: String(page.total) },
      {
        label: "Processing",
        value: String(page.items.filter((order) => order.status === "processing").length),
      },
      {
        label: "Completed",
        value: String(page.items.filter((order) => order.status === "completed").length),
      },
      {
        label: "Page gross value",
        value: currency.format(page.items.reduce((sum, order) => sum + order.total, 0)),
      },
    ],
    columns: [
      { key: "order", label: "Order", format: "mono" },
      { key: "customer", label: "Customer" },
      { key: "date", label: "Date" },
      { key: "payment", label: "Payment", format: "status" },
      { key: "status", label: "Status", format: "status" },
      { key: "total", label: "Total", align: "right" },
    ],
    rows: page.items.map((order) => ({
      id: order.id,
      order: order.number,
      customer: `Customer #${order.customerId}`,
      date: new Date(order.createdAt).toLocaleDateString("en-US"),
      payment: order.payment?.status ?? "unpaid",
      status: order.status,
      total: currency.format(order.total),
    })),
    linkPrefix: "/orders",
  });
}

export async function getCategoryWorkspaces() {
  const core = getEcommerceCore();
  const [categories, brands] = await Promise.all([
    core.catalog.listCategories({ perPage: 100 }),
    core.catalog.listBrands({ perPage: 100 }),
  ]);
  const categoryConfig = apiConfig({
    title: "Categories",
    description: "Catalog categories from the commerce API.",
    primaryAction: "Add category",
    searchPlaceholder: "Search category or slug...",
    metrics: [
      { label: "Categories", value: String(categories.total) },
      {
        label: "Published",
        value: String(categories.items.filter((item) => item.status === "published").length),
      },
      {
        label: "Draft",
        value: String(categories.items.filter((item) => item.status === "draft").length),
      },
      {
        label: "Featured",
        value: String(categories.items.filter((item) => item.featured).length),
      },
    ],
    columns: [
      { key: "category", label: "Category" },
      { key: "slug", label: "Slug", format: "mono" },
      { key: "parent", label: "Parent", format: "mono" },
      { key: "status", label: "Status", format: "status" },
    ],
    rows: categories.items.map((category) => ({
      id: category.id,
      category: category.name,
      slug: category.slug,
      parent: category.parentId ?? "—",
      status: category.status,
    })),
  });
  const brandConfig = apiConfig({
    title: "Brands",
    description: "Catalog brands from the commerce API.",
    primaryAction: "Add brand",
    searchPlaceholder: "Search brand...",
    metrics: [
      { label: "Brands", value: String(brands.total) },
      {
        label: "Published",
        value: String(brands.items.filter((item) => item.status === "published").length),
      },
      {
        label: "Draft",
        value: String(brands.items.filter((item) => item.status === "draft").length),
      },
      {
        label: "Featured",
        value: String(brands.items.filter((item) => item.featured).length),
      },
    ],
    columns: [
      { key: "brand", label: "Brand" },
      { key: "slug", label: "Slug", format: "mono" },
      { key: "website", label: "Website" },
      { key: "status", label: "Status", format: "status" },
    ],
    rows: brands.items.map((brand) => ({
      id: brand.id,
      brand: brand.name,
      slug: brand.slug,
      website: brand.website ?? "—",
      status: brand.status,
    })),
  });
  return { categories: categoryConfig, brands: brandConfig };
}

export async function getAttributeSets(): Promise<readonly AttributeSet[]> {
  return (await getEcommerceCore().catalog.listAttributeSets({ perPage: 100 })).items;
}

export async function getVariantsWorkspace(productId?: string): Promise<WorkspaceConfig> {
  const core = getEcommerceCore();
  const products = await core.catalog.listProducts({ perPage: 100 });
  const parent =
    products.items.find((product) => product.id === productId) ??
    products.items.find((product) => product.configurable) ??
    products.items[0];
  const variants = parent ? await core.catalog.listVariations(parent.id) : [];
  return apiConfig({
    title: "Variant matrix",
    description: parent
      ? `${parent.name} — variants from the commerce API.`
      : "No catalog product is available for variation management.",
    primaryAction: "Add variant",
    searchPlaceholder: "Search attributes or SKU...",
    metrics: [
      { label: "Total variants", value: String(variants.length) },
      {
        label: "Published",
        value: String(variants.filter((variant) => variant.status === "published").length),
      },
      {
        label: "Draft",
        value: String(variants.filter((variant) => variant.status === "draft").length),
      },
      { label: "Parent product", value: parent?.id ?? "—" },
    ],
    columns: [
      { key: "name", label: "Variant" },
      { key: "sku", label: "SKU", format: "mono" },
      { key: "price", label: "Price", align: "right" },
      { key: "status", label: "Status", format: "status" },
    ],
    rows: variants.map((variant) => ({
      id: variant.id,
      name: variant.name || `Variant #${variant.id}`,
      sku: variant.sku,
      price: currency.format(variant.price),
      status: variant.status,
    })),
  });
}

function reviewView(review: Review): ReviewView {
  return {
    id: review.id,
    author: review.customerName,
    product: `Product #${review.productId}`,
    rating: review.rating,
    text: review.body,
    status: review.status,
    time: new Date(review.createdAt).toLocaleDateString("en-US"),
  };
}

export async function getReviewViews(): Promise<readonly ReviewView[]> {
  const page = await getEcommerceCore().reviews.list({ perPage: 100 });
  return page.items.map(reviewView);
}
