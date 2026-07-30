import type { ProductDto } from "../types/product.dto";
import {
  productStatuses,
  type CreateProductInput,
  type Product,
} from "../types/product.types";
export function mapProductDto(dto: ProductDto): Product {
  const status = productStatuses.includes(
    dto.product_status as Product["status"],
  )
    ? (dto.product_status as Product["status"])
    : "draft";
  const inventoryStatus =
    dto.stock_quantity === 0
      ? "out-of-stock"
      : dto.stock_quantity < 10
        ? "low-stock"
        : "in-stock";
  return {
    id: dto.product_id,
    name: dto.product_name,
    sku: dto.product_sku,
    imageUrl: dto.image_url ?? undefined,
    categoryName: dto.category_name ?? undefined,
    price: Number(dto.unit_price),
    stock: dto.stock_quantity,
    inventoryStatus,
    status,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}
export function mapProductToRequest(product: CreateProductInput) {
  return {
    product_name: product.name,
    product_sku: product.sku,
    image_url: product.imageUrl || null,
    category_name: product.categoryName || null,
    unit_price: product.price,
    stock_quantity: product.stock,
    product_status: product.status,
  };
}
