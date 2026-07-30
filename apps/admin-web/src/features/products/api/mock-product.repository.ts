import { NotFoundError } from "@/core/errors/not-found-error";
import { productsMock } from "@/mocks/products.mock";
import type { ProductRepository } from "./product.repository";
import type { Product } from "../types/product.types";
let products = structuredClone(productsMock);
export const mockProductRepository: ProductRepository = {
  async list(filters) {
    let items = products.filter(
      (product) =>
        (!filters.search ||
          `${product.name} ${product.sku}`
            .toLowerCase()
            .includes(filters.search.toLowerCase())) &&
        (!filters.status || product.status === filters.status) &&
        (!filters.category || product.categoryName === filters.category) &&
        (!filters.stock || product.inventoryStatus === filters.stock),
    );
    const [field, direction] = filters.sort.split(".");
    items = [...items].sort((a, b) => {
      const left = a[field as keyof Product];
      const right = b[field as keyof Product];
      const compared =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right));
      return direction === "asc" ? compared : -compared;
    });
    const total = items.length;
    const start = (filters.page - 1) * filters.limit;
    return {
      items: items.slice(start, start + filters.limit),
      page: filters.page,
      limit: filters.limit,
      total,
      pageCount: Math.max(1, Math.ceil(total / filters.limit)),
    };
  },
  async summary() {
    return {
      total: products.length,
      active: products.filter((product) => product.status === "active").length,
      drafts: products.filter((product) => product.status === "draft").length,
      lowStock: products.filter(
        (product) => product.stock > 0 && product.stock < 10,
      ).length,
      categories: Array.from(
        new Set(
          products
            .map((product) => product.categoryName)
            .filter((category): category is string => Boolean(category)),
        ),
      ).sort(),
    };
  },
  async findById(id) {
    const product = products.find((item) => item.id === id);
    if (!product) throw new NotFoundError("Product not found");
    return structuredClone(product);
  },
  async create(input) {
    const now = new Date().toISOString();
    const product: Product = {
      ...input,
      inventoryStatus:
        input.stock === 0
          ? "out-of-stock"
          : input.stock < 10
            ? "low-stock"
            : "in-stock",
      id: `prd-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    };
    products = [product, ...products];
    return structuredClone(product);
  },
  async update(id, input) {
    const index = products.findIndex((item) => item.id === id);
    if (index < 0) throw new NotFoundError("Product not found");
    const inventoryStatus =
      input.stock === undefined
        ? products[index].inventoryStatus
        : input.stock === 0
          ? "out-of-stock"
          : input.stock < 10
            ? "low-stock"
            : "in-stock";
    products[index] = {
      ...products[index],
      ...input,
      inventoryStatus,
      updatedAt: new Date().toISOString(),
    };
    return structuredClone(products[index]);
  },
  async remove(id) {
    products = products.filter((item) => item.id !== id);
  },
};
