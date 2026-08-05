import "server-only";
import type { AttributeSet, Review } from "@platform/ecommerce-core";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import type { ReviewView, WorkspaceConfig } from "../types";
import type { OrdersView } from "../order-status";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export async function getOrdersData(): Promise<OrdersView> {
  const page = await getEcommerceCore().orders.list({ perPage: 100 });
  return {
    orders: page.items.map((order) => ({
      id: order.id,
      number: order.number,
      customerId: order.customerId,
      status: order.status,
      paymentStatus: order.payment?.status ?? "unpaid",
      total: order.total,
      totalLabel: currency.format(order.total),
      createdAt: order.createdAt,
      itemCount: order.items.length,
    })),
    metrics: {
      totalOrders: page.total,
      processing: page.items.filter((order) => order.status === "processing").length,
      completed: page.items.filter((order) => order.status === "completed").length,
      grossLabel: currency.format(page.items.reduce((sum, order) => sum + order.total, 0)),
    },
  };
}

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

const STORE_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  suspended: "Suspended",
  rejected: "Rejected",
  deactivated: "Deactivated",
};

function commissionLabel(type: string, value: number): string {
  return type === "percentage" ? `${value}%` : currency.format(value);
}

export async function getVendorsWorkspace(): Promise<WorkspaceConfig> {
  const page = await getEcommerceCore().vendors.listStores({ perPage: 100 });
  return apiConfig({
    title: "Vendors",
    description: `${page.total} marketplace stores from the commerce API.`,
    primaryAction: "Add vendor",
    searchPlaceholder: "Search store or slug...",
    metrics: [
      { label: "Total stores", value: String(page.total) },
      {
        label: "Trading",
        value: String(page.items.filter((store) => store.isTrading).length),
      },
      {
        label: "Pending",
        value: String(page.items.filter((store) => store.status === "pending").length),
      },
      {
        label: "Suspended",
        value: String(page.items.filter((store) => store.status === "suspended").length),
      },
    ],
    columns: [
      { key: "store", label: "Store" },
      { key: "slug", label: "Slug", format: "mono" },
      { key: "commission", label: "Commission", align: "right" },
      { key: "contact", label: "Contact" },
      { key: "status", label: "Status", format: "status" },
    ],
    rows: page.items.map((store) => ({
      id: store.id,
      store: store.name,
      slug: store.slug,
      commission: commissionLabel(store.commissionType, store.commissionValue),
      contact: store.contactEmail ?? "—",
      status: STORE_STATUS_LABELS[store.status] ?? store.status,
    })),
  });
}

export async function getWithdrawalsWorkspace(): Promise<WorkspaceConfig> {
  const page = await getEcommerceCore().vendors.listWithdrawals({ perPage: 100 });
  const pending = page.items.filter((item) => item.status === "pending");
  return apiConfig({
    title: "Withdrawals",
    description: `${page.total} vendor payout requests from the commerce API.`,
    primaryAction: "New withdrawal",
    searchPlaceholder: "Search reference or store...",
    metrics: [
      { label: "Total requests", value: String(page.total) },
      {
        label: "Pending",
        value: String(pending.length),
        change: pending.length ? "Action required" : undefined,
      },
      {
        label: "Paid",
        value: String(page.items.filter((item) => item.status === "paid").length),
      },
      {
        label: "Pending value",
        value: currency.format(pending.reduce((sum, item) => sum + item.amount, 0)),
      },
    ],
    columns: [
      { key: "reference", label: "Reference", format: "mono" },
      { key: "store", label: "Store" },
      { key: "amount", label: "Amount", align: "right" },
      { key: "requested", label: "Requested" },
      { key: "status", label: "Status", format: "status" },
    ],
    rows: page.items.map((item) => ({
      id: item.id,
      reference: item.reference,
      store: item.storeName ?? `Store #${item.storeId}`,
      amount: currency.format(item.amount),
      requested: item.requestedAt
        ? new Date(item.requestedAt).toLocaleDateString("en-US")
        : "—",
      status: item.status,
    })),
  });
}

const LEDGER_TYPE_LABELS: Record<string, string> = {
  accrued: "Accrued",
  reversal: "Reversal",
  partial_reversal: "Partial reversal",
  adjustment: "Adjustment",
  payout: "Payout",
};

export async function getLedgerWorkspace(): Promise<WorkspaceConfig> {
  const page = await getEcommerceCore().vendors.listLedger({ perPage: 100 });
  const credited = page.items.reduce(
    (sum, entry) => (entry.netAmount > 0 ? sum + entry.netAmount : sum),
    0,
  );
  const debited = page.items.reduce(
    (sum, entry) => (entry.netAmount < 0 ? sum + entry.netAmount : sum),
    0,
  );
  return apiConfig({
    title: "Commission ledger",
    description: `${page.total} ledger entries across every vendor.`,
    primaryAction: "Add entry",
    searchPlaceholder: "Search order or type...",
    metrics: [
      { label: "Entries", value: String(page.total) },
      {
        label: "Commission charged",
        value: currency.format(
          page.items.reduce((sum, entry) => sum + entry.commissionAmount, 0),
        ),
      },
      { label: "Credited (page)", value: currency.format(credited) },
      { label: "Debited (page)", value: currency.format(debited) },
    ],
    columns: [
      { key: "entry", label: "Entry", format: "mono" },
      { key: "type", label: "Type", format: "status" },
      { key: "order", label: "Order", format: "mono" },
      { key: "commission", label: "Commission", align: "right" },
      { key: "net", label: "Net", align: "right" },
      { key: "date", label: "Date" },
    ],
    rows: page.items.map((entry) => ({
      id: entry.id,
      entry: `#${entry.id}`,
      type: LEDGER_TYPE_LABELS[entry.type] ?? entry.type,
      order: entry.orderNumber ?? "—",
      commission: currency.format(entry.commissionAmount),
      net: currency.format(entry.netAmount),
      date: new Date(entry.createdAt).toLocaleDateString("en-US"),
    })),
  });
}
