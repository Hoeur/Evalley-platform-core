import type { PaginatedResult } from "@/core/utils/pagination";
import type {
  CreateProductInput,
  Product,
  ProductCatalogSummary,
  ProductListFilters,
  UpdateProductInput,
} from "../types/product.types";
export interface ProductRepository {
  list(filters: ProductListFilters): Promise<PaginatedResult<Product>>;
  summary(): Promise<ProductCatalogSummary>;
  findById(id: string): Promise<Product>;
  create(input: CreateProductInput): Promise<Product>;
  update(id: string, input: UpdateProductInput): Promise<Product>;
  remove(id: string): Promise<void>;
}
