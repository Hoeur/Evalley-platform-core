import { parseEnumValue, parsePositiveInteger } from "@/core/utils/pagination";
import {
  productSorts,
  productStatuses,
  productStockFilters,
  type ProductListFilters,
} from "../types/product.types";
type SearchParams = Record<string, string | string[] | undefined>;
const scalar = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;
export function parseProductFilters(params: SearchParams): ProductListFilters {
  return {
    page: parsePositiveInteger(scalar(params.page), 1),
    limit: Math.min(parsePositiveInteger(scalar(params.limit), 10), 100),
    search: scalar(params.q)?.trim() || undefined,
    status: parseEnumValue(scalar(params.status), productStatuses),
    category: scalar(params.category)?.trim() || undefined,
    stock: parseEnumValue(scalar(params.stock), productStockFilters),
    sort: parseEnumValue(scalar(params.sort), productSorts) ?? "createdAt.desc",
  };
}
export function serializeProductFilters(filters: ProductListFilters) {
  const params = new URLSearchParams();
  if (filters.page !== 1) params.set("page", String(filters.page));
  if (filters.limit !== 10) params.set("limit", String(filters.limit));
  if (filters.search) params.set("q", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.stock) params.set("stock", filters.stock);
  if (filters.sort && filters.sort !== "createdAt.desc")
    params.set("sort", filters.sort);
  return params.toString();
}
