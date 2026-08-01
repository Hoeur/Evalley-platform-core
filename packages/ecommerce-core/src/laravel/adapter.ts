import type {
  CustomerQuery,
  EcommerceCore,
  InventoryMovementInput,
  InventoryQuery,
  InventorySettingsInput,
  MovementReportQuery,
  OrderQuery,
  PageQuery,
  ProductQuery,
  PromotionQuery,
  ReviewQuery,
  SavePromotionInput,
  SaveAttributeSetInput,
  SaveAttributeValueInput,
  SaveBannerInput,
  SaveBrandInput,
  SaveCategoryInput,
  SaveFooterLinkInput,
  SaveFooterSettingsInput,
  SaveFooterSocialInput,
  SaveProductInput,
  SaveStaticPageInput,
  SaveVariationInput,
  UploadAsset,
} from "../contracts";
import type {
  LaravelAttributeSetDto,
  LaravelAttributeValueDto,
  LaravelBannerDto,
  LaravelBrandDto,
  LaravelCategoryDto,
  LaravelFooterLinkDto,
  LaravelFooterSettingDto,
  LaravelFooterSocialDto,
  LaravelCustomerDto,
  LaravelInventoryItemDto,
  LaravelInventoryMetricsDto,
  LaravelOrderDto,
  LaravelProductDto,
  LaravelPromotionDto,
  LaravelPromotionRedemptionDto,
  LaravelRefundDto,
  LaravelReviewDto,
  LaravelStaticPageDto,
  LaravelStockMovementDto,
} from "./dto";
import {
  mapAttributeSet,
  mapAttributeValue,
  mapBanner,
  mapBrand,
  mapCategory,
  mapCustomer,
  mapFooterLink,
  mapFooterSettings,
  mapFooterSocial,
  mapInventoryItem,
  mapInventoryMetrics,
  mapOrder,
  mapProduct,
  mapPromotion,
  mapPromotionRedemption,
  mapRefund,
  mapReview,
  mapStaticPage,
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

function movementReportQuery(query?: MovementReportQuery) {
  return {
    ...pageQuery(query),
    product_id: query?.productId,
    from: query?.from,
    to: query?.to,
  };
}

function bannerBody(input: Partial<SaveBannerInput>, locale: string) {
  return {
    link_url: input.linkUrl,
    status: input.status,
    order: input.order,
    translations:
      input.title === undefined
        ? undefined
        : {
            [locale]: {
              title: input.title,
              subtitle: input.subtitle ?? null,
              button_text: input.buttonText ?? null,
            },
          },
  };
}

function staticPageBody(input: Partial<SaveStaticPageInput>, locale: string) {
  return {
    slug: input.slug,
    status: input.status,
    translations:
      input.title === undefined && input.content === undefined
        ? undefined
        : { [locale]: { title: input.title, content: input.content } },
  };
}

function footerLinkBody(input: Partial<SaveFooterLinkInput>, locale: string) {
  return {
    group: input.group,
    url: input.url,
    order: input.order,
    status: input.status,
    translations:
      input.label === undefined
        ? undefined
        : { [locale]: { label: input.label } },
  };
}

function footerSocialBody(input: Partial<SaveFooterSocialInput>) {
  return {
    platform: input.platform,
    url: input.url,
    order: input.order,
    status: input.status,
  };
}

function footerSettingsBody(
  input: Partial<SaveFooterSettingsInput>,
  locale: string,
) {
  return {
    phone: input.phone,
    email: input.email,
    translations:
      input.about === undefined && input.address === undefined
        ? undefined
        : {
            [locale]: {
              about: input.about ?? null,
              address: input.address ?? null,
            },
          },
  };
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

function uploadBody(
  field: string,
  file: UploadAsset,
  extra?: Record<string, string>,
) {
  type MultipartBody = {
    append(name: string, value: unknown): void;
  };
  const Multipart = (
    globalThis as unknown as { FormData: new () => MultipartBody }
  ).FormData;
  const body = new Multipart();
  body.append(field, file);
  for (const [key, value] of Object.entries(extra ?? {})) {
    body.append(key, value);
  }
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

function customerQuery(query?: CustomerQuery) {
  return {
    page: query?.page,
    per_page: query?.perPage,
    q: query?.search,
    is_vendor: query?.isVendor,
    from: query?.from,
    to: query?.to,
  };
}

function promotionQuery(query?: PromotionQuery) {
  return {
    page: query?.page,
    per_page: query?.perPage,
    type: query?.type,
    status: query?.status,
  };
}

function promotionBody(input: Partial<SavePromotionInput>) {
  return {
    slug: input.slug,
    type: input.type,
    discount_type: input.discountType,
    discount_value: input.discountValue,
    max_discount_amount: input.maxDiscountAmount,
    conditions: input.conditions,
    priority: input.priority,
    is_exclusive: input.isExclusive,
    status: input.status,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    code: input.code,
    usage_limit: input.usageLimit,
    usage_limit_per_customer: input.usageLimitPerCustomer,
    translations: input.translations,
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
      async deleteProductImage(productId, mediaId) {
        await transport({
          method: "DELETE",
          path: `/catalog/products/${productId}/images/${mediaId}`,
        });
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
      async reportMovements(query) {
        const envelope = await transport<
          LaravelEnvelope<LaravelStockMovementDto>
        >({
          method: "GET",
          path: "/inventory/reports/movements",
          query: movementReportQuery(query),
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapStockMovement) };
      },
      async reportAdjustments(query) {
        const envelope = await transport<
          LaravelEnvelope<LaravelStockMovementDto>
        >({
          method: "GET",
          path: "/inventory/reports/adjustments",
          query: movementReportQuery(query),
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapStockMovement) };
      },
      async reportLowStock(query) {
        const envelope = await transport<
          LaravelEnvelope<LaravelInventoryItemDto>
        >({
          method: "GET",
          path: "/inventory/reports/low-stock",
          query: pageQuery(query),
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapInventoryItem) };
      },
      async reportOutOfStock(query) {
        const envelope = await transport<
          LaravelEnvelope<LaravelInventoryItemDto>
        >({
          method: "GET",
          path: "/inventory/reports/out-of-stock",
          query: pageQuery(query),
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapInventoryItem) };
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
    cms: {
      async listBanners(query) {
        const envelope = await transport<LaravelEnvelope<LaravelBannerDto>>({
          method: "GET",
          path: "/cms/banners",
          query: pageQuery(query),
        });
        const page = unwrapItems(envelope);
        return {
          ...page,
          items: page.items.map((item) => mapBanner(item, locale)),
        };
      },
      async createBanner(input) {
        const envelope = await transport<LaravelEnvelope<LaravelBannerDto>>({
          method: "POST",
          path: "/cms/banners",
          body: bannerBody(input, locale),
        });
        return mapBanner(unwrapItem(envelope), locale);
      },
      async updateBanner(id, input) {
        const envelope = await transport<LaravelEnvelope<LaravelBannerDto>>({
          method: "PUT",
          path: `/cms/banners/${id}`,
          body: bannerBody(input, locale),
        });
        return mapBanner(unwrapItem(envelope), locale);
      },
      async deleteBanner(id) {
        await transport({ method: "DELETE", path: `/cms/banners/${id}` });
      },
      async uploadBannerImage(id, device, file) {
        const envelope = await transport<LaravelEnvelope<LaravelBannerDto>>({
          method: "POST",
          path: `/cms/banners/${id}/image`,
          body: uploadBody("image", file, { device }),
        });
        return mapBanner(unwrapItem(envelope), locale);
      },
      async listStaticPages(query) {
        const envelope = await transport<LaravelEnvelope<LaravelStaticPageDto>>({
          method: "GET",
          path: "/cms/static-pages",
          query: pageQuery(query),
        });
        const page = unwrapItems(envelope);
        return {
          ...page,
          items: page.items.map((item) => mapStaticPage(item, locale)),
        };
      },
      async createStaticPage(input) {
        const envelope = await transport<LaravelEnvelope<LaravelStaticPageDto>>({
          method: "POST",
          path: "/cms/static-pages",
          body: staticPageBody(input, locale),
        });
        return mapStaticPage(unwrapItem(envelope), locale);
      },
      async updateStaticPage(id, input) {
        const envelope = await transport<LaravelEnvelope<LaravelStaticPageDto>>({
          method: "PUT",
          path: `/cms/static-pages/${id}`,
          body: staticPageBody(input, locale),
        });
        return mapStaticPage(unwrapItem(envelope), locale);
      },
      async deleteStaticPage(id) {
        await transport({ method: "DELETE", path: `/cms/static-pages/${id}` });
      },
      async listFooterLinks(query) {
        const envelope = await transport<LaravelEnvelope<LaravelFooterLinkDto>>({
          method: "GET",
          path: "/cms/footer-links",
          query: pageQuery(query),
        });
        const page = unwrapItems(envelope);
        return {
          ...page,
          items: page.items.map((item) => mapFooterLink(item, locale)),
        };
      },
      async createFooterLink(input) {
        const envelope = await transport<LaravelEnvelope<LaravelFooterLinkDto>>({
          method: "POST",
          path: "/cms/footer-links",
          body: footerLinkBody(input, locale),
        });
        return mapFooterLink(unwrapItem(envelope), locale);
      },
      async updateFooterLink(id, input) {
        const envelope = await transport<LaravelEnvelope<LaravelFooterLinkDto>>({
          method: "PUT",
          path: `/cms/footer-links/${id}`,
          body: footerLinkBody(input, locale),
        });
        return mapFooterLink(unwrapItem(envelope), locale);
      },
      async deleteFooterLink(id) {
        await transport({ method: "DELETE", path: `/cms/footer-links/${id}` });
      },
      async listFooterSocials(query) {
        const envelope = await transport<
          LaravelEnvelope<LaravelFooterSocialDto>
        >({
          method: "GET",
          path: "/cms/footer-socials",
          query: pageQuery(query),
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapFooterSocial) };
      },
      async createFooterSocial(input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelFooterSocialDto>
        >({
          method: "POST",
          path: "/cms/footer-socials",
          body: footerSocialBody(input),
        });
        return mapFooterSocial(unwrapItem(envelope));
      },
      async updateFooterSocial(id, input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelFooterSocialDto>
        >({
          method: "PUT",
          path: `/cms/footer-socials/${id}`,
          body: footerSocialBody(input),
        });
        return mapFooterSocial(unwrapItem(envelope));
      },
      async deleteFooterSocial(id) {
        await transport({ method: "DELETE", path: `/cms/footer-socials/${id}` });
      },
      async getFooterSettings() {
        const envelope = await transport<
          LaravelEnvelope<LaravelFooterSettingDto>
        >({
          method: "GET",
          path: "/cms/footer-settings",
        });
        return mapFooterSettings(unwrapItem(envelope), locale);
      },
      async updateFooterSettings(input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelFooterSettingDto>
        >({
          method: "PUT",
          path: "/cms/footer-settings",
          body: footerSettingsBody(input, locale),
        });
        return mapFooterSettings(unwrapItem(envelope), locale);
      },
    },
    customers: {
      async list(query) {
        const envelope = await transport<LaravelEnvelope<LaravelCustomerDto>>({
          method: "GET",
          path: "/customers",
          query: customerQuery(query),
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapCustomer) };
      },
      async get(id) {
        const envelope = await transport<LaravelEnvelope<LaravelCustomerDto>>({
          method: "GET",
          path: `/customers/${id}`,
        });
        return mapCustomer(unwrapItem(envelope));
      },
      async resetPassword(id, password) {
        const envelope = await transport<LaravelEnvelope<LaravelCustomerDto>>({
          method: "POST",
          path: `/customers/${id}/reset-password`,
          body: { password, password_confirmation: password },
        });
        return mapCustomer(unwrapItem(envelope));
      },
    },
    promotions: {
      async list(query) {
        const envelope = await transport<LaravelEnvelope<LaravelPromotionDto>>({
          method: "GET",
          path: "/promotions",
          query: promotionQuery(query),
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapPromotion) };
      },
      async get(id) {
        const envelope = await transport<LaravelEnvelope<LaravelPromotionDto>>({
          method: "GET",
          path: `/promotions/${id}`,
        });
        return mapPromotion(unwrapItem(envelope));
      },
      async create(input) {
        const envelope = await transport<LaravelEnvelope<LaravelPromotionDto>>({
          method: "POST",
          path: "/promotions",
          body: promotionBody(input),
        });
        return mapPromotion(unwrapItem(envelope));
      },
      async update(id, input) {
        const envelope = await transport<LaravelEnvelope<LaravelPromotionDto>>({
          method: "PUT",
          path: `/promotions/${id}`,
          body: promotionBody(input),
        });
        return mapPromotion(unwrapItem(envelope));
      },
      async delete(id) {
        await transport({ method: "DELETE", path: `/promotions/${id}` });
      },
      async publish(id) {
        const envelope = await transport<LaravelEnvelope<LaravelPromotionDto>>({
          method: "POST",
          path: `/promotions/${id}/publish`,
        });
        return mapPromotion(unwrapItem(envelope));
      },
      async pause(id) {
        const envelope = await transport<LaravelEnvelope<LaravelPromotionDto>>({
          method: "POST",
          path: `/promotions/${id}/pause`,
        });
        return mapPromotion(unwrapItem(envelope));
      },
      async listRedemptions(id, query) {
        const envelope = await transport<
          LaravelEnvelope<LaravelPromotionRedemptionDto>
        >({
          method: "GET",
          path: `/promotions/${id}/redemptions`,
          query: pageQuery(query),
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapPromotionRedemption) };
      },
    },
  };
}
