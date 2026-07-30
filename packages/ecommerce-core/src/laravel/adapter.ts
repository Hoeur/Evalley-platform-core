import type {
  EcommerceCore,
  InventoryMovementInput,
  InventoryQuery,
  InventorySettingsInput,
  OrderQuery,
  PageQuery,
  ProductQuery,
  ReviewQuery,
  SaveAttributeSetInput,
  SaveAttributeValueInput,
  SaveBrandInput,
  SaveCategoryInput,
  SaveProductInput,
  SaveVariationInput,
  UploadAsset,
} from "../contracts";
import type {
  LaravelAttributeSetDto,
  LaravelAttributeValueDto,
  LaravelBrandDto,
  LaravelCategoryDto,
  LaravelInventoryItemDto,
  LaravelInventoryMetricsDto,
  LaravelOrderDto,
  LaravelProductDto,
  LaravelRefundDto,
  LaravelReviewDto,
  LaravelStockMovementDto,
} from "./dto";
import {
  mapAttributeSet,
  mapAttributeValue,
  mapBrand,
  mapCategory,
  mapInventoryItem,
  mapInventoryMetrics,
  mapOrder,
  mapProduct,
  mapRefund,
  mapReview,
  mapStockMovement,
} from "./mappers";
import {
  type EcommerceTransport,
  type LaravelEnvelope,
  unwrapItem,
  unwrapItems,
} from "./transport";

type LaravelAdapterOptions = {
  readonly transport: EcommerceTransport;
  readonly locale?: string;
};

function pageQuery(query?: PageQuery) {
  return { page: query?.page, per_page: query?.perPage };
}

function productQuery(query?: ProductQuery) {
  return {
    ...pageQuery(query),
    q: query?.search,
    status: query?.status,
    brand_id: query?.brandId,
    category_id: query?.categoryId,
    is_featured: query?.featured,
    sort_by: query?.sortBy,
    sort_direction: query?.sortDirection,
  };
}

function inventoryQuery(query?: InventoryQuery) {
  return {
    ...pageQuery(query),
    status: query?.status,
    keyword: query?.keyword,
    sku: query?.sku,
    category_id: query?.categoryId,
    product_status: query?.productStatus,
    include_variations: query?.includeVariations,
    product_sort_by: query?.productSortBy,
    product_sort_direction: query?.productSortDirection,
    manage_stock: query?.manageStock,
    allow_backorder: query?.allowBackorder,
    sort_by: query?.sortBy,
    sort_direction: query?.sortDirection,
  };
}

function orderQuery(query?: OrderQuery) {
  return {
    ...pageQuery(query),
    status: query?.status,
    payment_status: query?.paymentStatus,
    customer_id: query?.customerId,
    from: query?.from,
    to: query?.to,
  };
}

function reviewQuery(query?: ReviewQuery) {
  return {
    ...pageQuery(query),
    status: query?.status,
    product_id: query?.productId,
  };
}

function productBody(input: Partial<SaveProductInput>, locale: string) {
  const translations =
    input.translations ??
    (input.name === undefined
      ? undefined
      : {
          [locale]: {
            name: input.name,
            description: input.description ?? null,
          },
        });
  return {
    brand_id: input.brandId,
    sku: input.sku,
    barcode: input.barcode,
    slug: input.slug,
    status: input.status,
    is_featured: input.featured,
    order: input.order,
    price: input.price,
    sale_price: input.salePrice,
    sale_starts_at: input.saleStartsAt,
    sale_ends_at: input.saleEndsAt,
    weight: input.weight,
    length: input.length,
    width: input.width,
    height: input.height,
    category_ids: input.categoryIds,
    translations,
  };
}

function uploadBody(field: string, file: UploadAsset) {
  type MultipartBody = {
    append(name: string, value: unknown): void;
  };
  const Multipart = (
    globalThis as unknown as { FormData: new () => MultipartBody }
  ).FormData;
  const body = new Multipart();
  body.append(field, file);
  return body;
}

function categoryBody(input: Partial<SaveCategoryInput>, locale: string) {
  const translations =
    input.translations ??
    (input.name === undefined
      ? undefined
      : {
          [locale]: {
            name: input.name,
            description: input.description ?? null,
          },
        });
  return {
    parent_id: input.parentId,
    slug: input.slug,
    status: input.status,
    order: input.order,
    is_featured: input.featured,
    translations,
  };
}

function brandBody(input: Partial<SaveBrandInput>, locale: string) {
  const translations =
    input.translations ??
    (input.name === undefined
      ? undefined
      : {
          [locale]: {
            name: input.name,
            description: input.description ?? null,
          },
        });
  return {
    slug: input.slug,
    website: input.website,
    status: input.status,
    order: input.order,
    is_featured: input.featured,
    translations,
  };
}

function attributeSetBody(
  input: Partial<SaveAttributeSetInput>,
  locale: string,
) {
  const translations =
    input.translations ??
    (input.name === undefined ? undefined : { [locale]: { name: input.name } });
  return {
    code: input.code,
    order: input.order,
    translations,
  };
}

function attributeValueBody(
  input: Partial<SaveAttributeValueInput>,
  locale: string,
) {
  const translations =
    input.translations ??
    (input.name === undefined ? undefined : { [locale]: { name: input.name } });
  return {
    order: input.order,
    translations,
  };
}

function variationBody(input: SaveVariationInput, locale: string) {
  const translations =
    input.translations ??
    (input.name === undefined
      ? undefined
      : {
          [locale]: {
            name: input.name,
            description: input.description ?? null,
          },
        });
  return {
    attribute_value_ids: input.attributeValueIds,
    sku: input.sku,
    barcode: input.barcode,
    status: input.status,
    is_featured: input.featured,
    price: input.price,
    sale_price: input.salePrice,
    sale_starts_at: input.saleStartsAt,
    sale_ends_at: input.saleEndsAt,
    weight: input.weight,
    length: input.length,
    width: input.width,
    height: input.height,
    translations,
  };
}

function inventorySettingsBody(input: InventorySettingsInput) {
  return {
    manage_stock: input.manageStock,
    allow_backorder: input.allowBackorder,
    low_stock_threshold: input.lowStockThreshold,
    expected_version: input.expectedVersion,
  };
}

function movementBody(input: InventoryMovementInput) {
  return {
    delta: input.delta,
    reason: input.reason,
    note: input.note,
    reference_key: input.referenceKey,
  };
}

export function createLaravelEcommerceCore({
  transport,
  locale = "en",
}: LaravelAdapterOptions): EcommerceCore {
  return {
    catalog: {
      async listProducts(query) {
        const envelope = await transport<LaravelEnvelope<LaravelProductDto>>({
          method: "GET",
          path: "/catalog/products",
          query: productQuery(query),
        });
        const page = unwrapItems(envelope);
        return {
          ...page,
          items: page.items.map((item) => mapProduct(item, locale)),
        };
      },
      async getProduct(id) {
        const envelope = await transport<LaravelEnvelope<LaravelProductDto>>({
          method: "GET",
          path: `/catalog/products/${id}`,
        });
        return mapProduct(unwrapItem(envelope), locale);
      },
      async createProduct(input) {
        const envelope = await transport<LaravelEnvelope<LaravelProductDto>>({
          method: "POST",
          path: "/catalog/products",
          body: productBody(input, locale),
        });
        return mapProduct(unwrapItem(envelope), locale);
      },
      async updateProduct(id, input) {
        const envelope = await transport<LaravelEnvelope<LaravelProductDto>>({
          method: "PUT",
          path: `/catalog/products/${id}`,
          body: productBody(input, locale),
        });
        return mapProduct(unwrapItem(envelope), locale);
      },
      async deleteProduct(id) {
        await transport({ method: "DELETE", path: `/catalog/products/${id}` });
      },
      async uploadProductImage(id, file) {
        const envelope = await transport<LaravelEnvelope<LaravelProductDto>>({
          method: "POST",
          path: `/catalog/products/${id}/images`,
          body: uploadBody("image", file),
        });
        return mapProduct(unwrapItem(envelope), locale);
      },
      async listVariations(productId) {
        const envelope = await transport<LaravelEnvelope<LaravelProductDto>>({
          method: "GET",
          path: `/catalog/products/${productId}/variations`,
        });
        return unwrapItems(envelope).items.map((item) =>
          mapProduct(item, locale),
        );
      },
      async createVariations(productId, input) {
        const envelope = await transport<LaravelEnvelope<LaravelProductDto>>({
          method: "POST",
          path: `/catalog/products/${productId}/variations`,
          body: {
            variations: input.map((item) => variationBody(item, locale)),
          },
        });
        return unwrapItems(envelope).items.map((item) =>
          mapProduct(item, locale),
        );
      },
      async deleteVariation(productId, variationId) {
        await transport({
          method: "DELETE",
          path: `/catalog/products/${productId}/variations/${variationId}`,
        });
      },
      async listCategories(query) {
        const envelope = await transport<LaravelEnvelope<LaravelCategoryDto>>({
          method: "GET",
          path: "/catalog/categories",
          query: pageQuery(query),
        });
        const page = unwrapItems(envelope);
        return {
          ...page,
          items: page.items.map((item) => mapCategory(item, locale)),
        };
      },
      async getCategory(id) {
        const envelope = await transport<LaravelEnvelope<LaravelCategoryDto>>({
          method: "GET",
          path: `/catalog/categories/${id}`,
        });
        return mapCategory(unwrapItem(envelope), locale);
      },
      async createCategory(input) {
        const envelope = await transport<LaravelEnvelope<LaravelCategoryDto>>({
          method: "POST",
          path: "/catalog/categories",
          body: categoryBody(input, locale),
        });
        return mapCategory(unwrapItem(envelope), locale);
      },
      async updateCategory(id, input) {
        const envelope = await transport<LaravelEnvelope<LaravelCategoryDto>>({
          method: "PUT",
          path: `/catalog/categories/${id}`,
          body: categoryBody(input, locale),
        });
        return mapCategory(unwrapItem(envelope), locale);
      },
      async deleteCategory(id) {
        await transport({
          method: "DELETE",
          path: `/catalog/categories/${id}`,
        });
      },
      async uploadCategoryImage(id, file) {
        const envelope = await transport<LaravelEnvelope<LaravelCategoryDto>>({
          method: "POST",
          path: `/catalog/categories/${id}/image`,
          body: uploadBody("image", file),
        });
        return mapCategory(unwrapItem(envelope), locale);
      },
      async listBrands(query) {
        const envelope = await transport<LaravelEnvelope<LaravelBrandDto>>({
          method: "GET",
          path: "/catalog/brands",
          query: pageQuery(query),
        });
        const page = unwrapItems(envelope);
        return {
          ...page,
          items: page.items.map((item) => mapBrand(item, locale)),
        };
      },
      async getBrand(id) {
        const envelope = await transport<LaravelEnvelope<LaravelBrandDto>>({
          method: "GET",
          path: `/catalog/brands/${id}`,
        });
        return mapBrand(unwrapItem(envelope), locale);
      },
      async createBrand(input) {
        const envelope = await transport<LaravelEnvelope<LaravelBrandDto>>({
          method: "POST",
          path: "/catalog/brands",
          body: brandBody(input, locale),
        });
        return mapBrand(unwrapItem(envelope), locale);
      },
      async updateBrand(id, input) {
        const envelope = await transport<LaravelEnvelope<LaravelBrandDto>>({
          method: "PUT",
          path: `/catalog/brands/${id}`,
          body: brandBody(input, locale),
        });
        return mapBrand(unwrapItem(envelope), locale);
      },
      async deleteBrand(id) {
        await transport({ method: "DELETE", path: `/catalog/brands/${id}` });
      },
      async uploadBrandLogo(id, file) {
        const envelope = await transport<LaravelEnvelope<LaravelBrandDto>>({
          method: "POST",
          path: `/catalog/brands/${id}/logo`,
          body: uploadBody("logo", file),
        });
        return mapBrand(unwrapItem(envelope), locale);
      },
      async listAttributeSets(query) {
        const envelope = await transport<
          LaravelEnvelope<LaravelAttributeSetDto>
        >({
          method: "GET",
          path: "/catalog/attribute-sets",
          query: pageQuery(query),
        });
        const page = unwrapItems(envelope);
        return {
          ...page,
          items: page.items.map((item) => mapAttributeSet(item, locale)),
        };
      },
      async getAttributeSet(id) {
        const envelope = await transport<
          LaravelEnvelope<LaravelAttributeSetDto>
        >({
          method: "GET",
          path: `/catalog/attribute-sets/${id}`,
        });
        return mapAttributeSet(unwrapItem(envelope), locale);
      },
      async createAttributeSet(input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelAttributeSetDto>
        >({
          method: "POST",
          path: "/catalog/attribute-sets",
          body: attributeSetBody(input, locale),
        });
        return mapAttributeSet(unwrapItem(envelope), locale);
      },
      async updateAttributeSet(id, input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelAttributeSetDto>
        >({
          method: "PUT",
          path: `/catalog/attribute-sets/${id}`,
          body: attributeSetBody(input, locale),
        });
        return mapAttributeSet(unwrapItem(envelope), locale);
      },
      async deleteAttributeSet(id) {
        await transport({
          method: "DELETE",
          path: `/catalog/attribute-sets/${id}`,
        });
      },
      async createAttributeValue(attributeSetId, input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelAttributeValueDto>
        >({
          method: "POST",
          path: `/catalog/attribute-sets/${attributeSetId}/values`,
          body: attributeValueBody(input, locale),
        });
        return mapAttributeValue(unwrapItem(envelope), locale);
      },
      async updateAttributeValue(attributeSetId, valueId, input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelAttributeValueDto>
        >({
          method: "PUT",
          path: `/catalog/attribute-sets/${attributeSetId}/values/${valueId}`,
          body: attributeValueBody(input, locale),
        });
        return mapAttributeValue(unwrapItem(envelope), locale);
      },
      async deleteAttributeValue(attributeSetId, valueId) {
        await transport({
          method: "DELETE",
          path: `/catalog/attribute-sets/${attributeSetId}/values/${valueId}`,
        });
      },
    },
    inventory: {
      async list(query) {
        const envelope = await transport<
          LaravelEnvelope<LaravelInventoryItemDto>
        >({
          method: "GET",
          path: "/inventory",
          query: inventoryQuery(query),
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapInventoryItem) };
      },
      async metrics() {
        const envelope = await transport<
          LaravelEnvelope<LaravelInventoryMetricsDto>
        >({
          method: "GET",
          path: "/inventory/metrics",
        });
        return mapInventoryMetrics(unwrapItem(envelope));
      },
      async get(productId) {
        const envelope = await transport<
          LaravelEnvelope<LaravelInventoryItemDto>
        >({
          method: "GET",
          path: `/inventory/${productId}`,
        });
        return mapInventoryItem(unwrapItem(envelope));
      },
      async updateSettings(productId, input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelInventoryItemDto>
        >({
          method: "PATCH",
          path: `/inventory/${productId}/settings`,
          body: inventorySettingsBody(input),
        });
        return mapInventoryItem(unwrapItem(envelope));
      },
      async applyMovement(productId, input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelInventoryItemDto>
        >({
          method: "POST",
          path: `/inventory/${productId}/movements`,
          body: movementBody(input),
        });
        return mapInventoryItem(unwrapItem(envelope));
      },
      async movements(productId, query) {
        const envelope = await transport<
          LaravelEnvelope<LaravelStockMovementDto>
        >({
          method: "GET",
          path: `/inventory/${productId}/movements`,
          query: pageQuery(query),
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapStockMovement) };
      },
    },
    orders: {
      async list(query) {
        const envelope = await transport<LaravelEnvelope<LaravelOrderDto>>({
          method: "GET",
          path: "/orders",
          query: orderQuery(query),
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapOrder) };
      },
      async get(id) {
        const envelope = await transport<LaravelEnvelope<LaravelOrderDto>>({
          method: "GET",
          path: `/orders/${id}`,
        });
        return mapOrder(unwrapItem(envelope));
      },
      async updateStatus(id, status) {
        const envelope = await transport<LaravelEnvelope<LaravelOrderDto>>({
          method: "PATCH",
          path: `/orders/${id}/status`,
          body: { status },
        });
        return mapOrder(unwrapItem(envelope));
      },
      async markPaid(id) {
        const envelope = await transport<LaravelEnvelope<LaravelOrderDto>>({
          method: "POST",
          path: `/orders/${id}/mark-paid`,
        });
        return mapOrder(unwrapItem(envelope));
      },
      async listRefunds(id) {
        const envelope = await transport<LaravelEnvelope<LaravelRefundDto>>({
          method: "GET",
          path: `/orders/${id}/refunds`,
        });
        return unwrapItems(envelope).items.map(mapRefund);
      },
      async createRefund(id, amount, reason) {
        const envelope = await transport<LaravelEnvelope<LaravelRefundDto>>({
          method: "POST",
          path: `/orders/${id}/refunds`,
          body: { amount, reason },
        });
        return mapRefund(unwrapItem(envelope));
      },
    },
    reviews: {
      async list(query) {
        const envelope = await transport<LaravelEnvelope<LaravelReviewDto>>({
          method: "GET",
          path: "/reviews",
          query: reviewQuery(query),
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapReview) };
      },
      async approve(id) {
        const envelope = await transport<LaravelEnvelope<LaravelReviewDto>>({
          method: "POST",
          path: `/reviews/${id}/approve`,
        });
        return mapReview(unwrapItem(envelope));
      },
      async reject(id) {
        const envelope = await transport<LaravelEnvelope<LaravelReviewDto>>({
          method: "POST",
          path: `/reviews/${id}/reject`,
        });
        return mapReview(unwrapItem(envelope));
      },
    },
  };
}
