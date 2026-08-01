export const productStatuses = ["draft", "active"] as const;
export const productStockFilters = [
  "in-stock",
  "low-stock",
  "out-of-stock",
] as const;
export const productSorts = [
  "createdAt.desc",
  "name.asc",
  "price.desc",
  "price.asc",
  "stock.asc",
] as const;
export type ProductStatus = (typeof productStatuses)[number];
export type ProductStockFilter = (typeof productStockFilters)[number];
export type ProductSort = (typeof productSorts)[number];
export type ProductInventoryStatus = ProductStockFilter | "backorder";
export type Product = {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  slug?: string;
  brandId?: string | null;
  description?: string;
  translations?: Translations;
  imageUrl?: string;
  imageUrls?: string[];
  images?: { id: string; url: string }[];
  categoryName?: string;
  categoryIds?: string[];
  price: number;
  salePrice?: number | null;
  saleStartsAt?: string | null;
  saleEndsAt?: string | null;
  featured?: boolean;
  order?: number;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  stock: number;
  inventoryStatus: ProductInventoryStatus;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};
export type ProductListFilters = {
  page: number;
  limit: number;
  search?: string;
  status?: ProductStatus;
  category?: string;
  stock?: ProductStockFilter;
  sort: ProductSort;
};
export type ProductCatalogSummary = {
  total: number;
  active: number;
  drafts: number;
  lowStock: number;
  categories: string[];
};
export type CreateProductInput = Omit<
  Product,
  "id" | "createdAt" | "updatedAt" | "inventoryStatus" | "imageUrls" | "images"
>;
export type UpdateProductInput = Partial<CreateProductInput>;
import type { Translations } from "@platform/ecommerce-core";
