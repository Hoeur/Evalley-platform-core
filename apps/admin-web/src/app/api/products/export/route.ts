import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getProductRepository } from "@/features/products/api/product.repository.server";
import { parseProductFilters } from "@/features/products/api/product.queries";

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export async function GET(request: Request) {
  await requireModuleAccess("products", "products.read");
  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  const filters = { ...parseProductFilters(searchParams), page: 1, limit: 10_000 };
  const result = await getProductRepository().list(filters);
  const rows = result.items.map((product) => [product.name, product.sku, product.categoryName ?? "", product.price, product.stock, product.status, product.updatedAt]);
  const csv = [["Name", "SKU", "Category", "Price", "Stock", "Status", "Updated"], ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="products-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
