import "server-only";
import { resolveClient } from "@/clients/client-resolver.server";
import type { ProductRepository } from "./product.repository";
import { laravelProductRepository } from "./laravel-product.repository";
import { mockProductRepository } from "./mock-product.repository";

export function getProductRepository(): ProductRepository {
  const adapter = resolveClient().server.api.adapter;
  if (adapter === "mock") return mockProductRepository;
  if (adapter === "standard") return laravelProductRepository;
  throw new Error(
    `Product adapter "${adapter}" is not supported by @platform/ecommerce-core.`,
  );
}
