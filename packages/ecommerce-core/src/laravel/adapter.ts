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
  NotificationQuery,
  CustomerGroupQuery,
  SendBroadcastInput,
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
  LaravelNotificationDto,
  LaravelBroadcastDto,
  LaravelUnreadCountDto,
  LaravelMarkedReadDto,
  LaravelCustomerGroupDto,
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
  mapAdminNotification,
  mapNotificationBroadcast,
  mapCustomerGroupSummary,
} from "./mappers";
import {
  type EcommerceTransport,
  type LaravelEnvelope,
  unwrapItem,
  unwrapItems,
} from "./transport";
import type {
  LaravelStoreDto,
  LaravelCommissionEntryDto,
  LaravelVendorBalanceDto,
  LaravelWithdrawalDto,
} from "./dto";
import {
  mapVendorStore,
  mapCommissionEntry,
  mapVendorBalance,
  mapWithdrawal,
} from "./mappers";
import type {
  SaveCustomerGroupInput,
  SaveShippingCarrierInput,
  SaveShippingZoneInput,
  SaveShippingMethodInput,
  SaveShippingRateInput,
} from "../contracts";
import type {
  LaravelShippingCarrierDto,
  LaravelShippingZoneDto,
  LaravelShippingMethodDto,
  LaravelShippingRateDto,
  LaravelShipmentDto,
  LaravelFulfillmentDto,
  LaravelDashboardDto,
  LaravelRevenueSeriesDto,
  LaravelCommissionSummaryDto,
} from "./dto";
import {
  mapCustomerGroup,
  mapShippingCarrier,
  mapShippingZone,
  mapShippingMethod,
  mapShippingRate,
  mapShipment,
  mapOrderFulfillment,
  mapDashboardSnapshot,
  mapRevenueSeries,
  mapCommissionSummary,
} from "./mappers";

function shippingCarrierBody(input: Partial<SaveShippingCarrierInput>) {
  return {
    name: input.name,
    code: input.code,
    tracking_url_template: input.trackingUrlTemplate,
    phone: input.phone,
    website: input.website,
    is_active: input.isActive,
    order: input.order,
  };
}

function shippingZoneBody(input: Partial<SaveShippingZoneInput>) {
  return {
    name: input.name,
    country_codes: input.countryCodes,
    states: input.states,
    priority: input.priority,
    is_active: input.isActive,
  };
}

function shippingRateBody(input: Partial<SaveShippingRateInput>) {
  return {
    min_value: input.minValue,
    max_value: input.maxValue,
    price: input.price === undefined ? undefined : String(input.price),
  };
}

function shippingMethodBody(input: Partial<SaveShippingMethodInput>) {
  return {
    shipping_zone_id: input.zoneId,
    shipping_carrier_id: input.carrierId,
    code: input.code,
    rate_type: input.rateType,
    base_rate: input.baseRate === undefined ? undefined : String(input.baseRate),
    free_over_amount:
      input.freeOverAmount === undefined || input.freeOverAmount === null
        ? input.freeOverAmount
        : String(input.freeOverAmount),
    min_delivery_days: input.minDeliveryDays,
    max_delivery_days: input.maxDeliveryDays,
    is_active: input.isActive,
    order: input.order,
    translations: input.translations,
    rates: input.rates?.map((rate) => ({
      min_value: rate.minValue,
      max_value: rate.maxValue,
      price: String(rate.price),
    })),
  };
}

function customerGroupBody(input: Partial<SaveCustomerGroupInput>) {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description,
    is_active: input.isActive,
  };
}

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

const UPLOAD_IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

function uploadBody(
  field: string,
  file: UploadAsset,
  extra?: Record<string, string>,
) {
  type MultipartBody = {
    append(name: string, value: unknown, filename?: string): void;
  };
  const runtime = globalThis as unknown as {
    FormData: new () => MultipartBody;
    File: new (
      parts: readonly unknown[],
      name: string,
      options?: { type?: string },
    ) => UploadAsset;
  };
  const body = new runtime.FormData();

  // A server action can hand us a nameless / typeless Blob. Appended as-is,
  // undici stamps the multipart part as `filename="blob"` (no extension) and,
  // when the Blob carries no type, `Content-Type: application/octet-stream` —
  // which Laravel's `image` validation rejects with "The image field must be
  // an image." Force a real image filename + content-type so the upload is
  // accepted no matter how the file reached us (browser File, forwarded Blob).
  const asset = file as { name?: unknown; type?: unknown };
  const originalType =
    typeof asset.type === "string" && asset.type ? asset.type : "";
  const isImageType = originalType.startsWith("image/");
  const type = isImageType ? originalType : "image/jpeg";
  const originalName =
    typeof asset.name === "string" && asset.name.includes(".")
      ? asset.name
      : "";
  const filename =
    originalName || `${field}.${UPLOAD_IMAGE_EXTENSIONS[type] ?? "jpg"}`;
  // Only re-wrap when the content-type is missing / non-image; otherwise keep
  // the original file untouched and just pin the filename via the 3rd arg.
  const value = isImageType ? file : new runtime.File([file], filename, { type });

  body.append(field, value, filename);
  for (const [key, extraValue] of Object.entries(extra ?? {})) {
    body.append(key, extraValue);
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

function notificationQuery(query?: NotificationQuery) {
  return {
    page: query?.page,
    per_page: query?.perPage,
    unread_only: query?.unreadOnly,
  };
}

function customerGroupQuery(query?: CustomerGroupQuery) {
  return {
    page: query?.page,
    per_page: query?.perPage,
    q: query?.search,
    active_only: query?.activeOnly,
  };
}

function broadcastBody(input: SendBroadcastInput) {
  return {
    title: input.title,
    body: input.body,
    target_type: input.targetType,
    // The API validates these as integers; ids travel as strings on the
    // frontend, so coerce and only send the one the target type needs.
    customer_ids:
      input.targetType === "customers"
        ? input.customerIds?.map(Number)
        : undefined,
    group_ids:
      input.targetType === "groups" ? input.groupIds?.map(Number) : undefined,
    channels: input.channels,
    data: input.data,
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
      async deleteCategoryImage(id) {
        await transport({
          method: "DELETE",
          path: `/catalog/categories/${id}/image`,
        });
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
      async deleteBrandLogo(id) {
        await transport({
          method: "DELETE",
          path: `/catalog/brands/${id}/logo`,
        });
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
      async deleteBannerImage(id, device) {
        await transport({
          method: "DELETE",
          path: `/cms/banners/${id}/image/${device}`,
        });
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
      async update(id, input) {
        const envelope = await transport<LaravelEnvelope<LaravelCustomerDto>>({
          method: "PATCH",
          path: `/customers/${id}`,
          body: {
            name: input.name,
            email: input.email,
            phone: input.phone,
            birthdate: input.birthdate,
          },
        });
        return mapCustomer(unwrapItem(envelope));
      },
      async delete(id) {
        await transport({ method: "DELETE", path: `/customers/${id}` });
      },
      async suspend(id, reason) {
        const envelope = await transport<LaravelEnvelope<LaravelCustomerDto>>({
          method: "POST",
          path: `/customers/${id}/suspend`,
          body: { reason: reason ?? undefined },
        });
        return mapCustomer(unwrapItem(envelope));
      },
      async activate(id) {
        const envelope = await transport<LaravelEnvelope<LaravelCustomerDto>>({
          method: "POST",
          path: `/customers/${id}/activate`,
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
    notifications: {
      async listInbox(query) {
        const envelope = await transport<
          LaravelEnvelope<LaravelNotificationDto>
        >({
          method: "GET",
          path: "/notifications",
          query: notificationQuery(query),
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapAdminNotification) };
      },
      async unreadCount() {
        const envelope = await transport<
          LaravelEnvelope<LaravelUnreadCountDto>
        >({
          method: "GET",
          path: "/notifications/unread-count",
        });
        return unwrapItem(envelope).unread_count;
      },
      async markRead(id) {
        const envelope = await transport<
          LaravelEnvelope<LaravelNotificationDto>
        >({
          method: "POST",
          path: `/notifications/${id}/read`,
        });
        return mapAdminNotification(unwrapItem(envelope));
      },
      async markAllRead() {
        const envelope = await transport<
          LaravelEnvelope<LaravelMarkedReadDto>
        >({
          method: "POST",
          path: "/notifications/read-all",
        });
        return unwrapItem(envelope).marked_read;
      },
      async delete(id) {
        await transport({ method: "DELETE", path: `/notifications/${id}` });
      },
      async listBroadcasts(query) {
        const envelope = await transport<LaravelEnvelope<LaravelBroadcastDto>>({
          method: "GET",
          path: "/notification-broadcasts",
          query: pageQuery(query),
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapNotificationBroadcast) };
      },
      async getBroadcast(id) {
        const envelope = await transport<LaravelEnvelope<LaravelBroadcastDto>>({
          method: "GET",
          path: `/notification-broadcasts/${id}`,
        });
        return mapNotificationBroadcast(unwrapItem(envelope));
      },
      async sendBroadcast(input) {
        const envelope = await transport<LaravelEnvelope<LaravelBroadcastDto>>({
          method: "POST",
          path: "/notification-broadcasts",
          body: broadcastBody(input),
        });
        return mapNotificationBroadcast(unwrapItem(envelope));
      },
      async listCustomerGroups(query) {
        const envelope = await transport<
          LaravelEnvelope<LaravelCustomerGroupDto>
        >({
          method: "GET",
          path: "/customer-groups",
          query: customerGroupQuery(query),
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapCustomerGroupSummary) };
      },
    },
    vendors: {
      async listStores(query) {
        const envelope = await transport<LaravelEnvelope<LaravelStoreDto>>({
          method: "GET",
          path: "/vendors",
          query: { ...pageQuery(query), status: query?.status, q: query?.search },
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapVendorStore) };
      },
      async getStore(id) {
        const envelope = await transport<LaravelEnvelope<LaravelStoreDto>>({
          method: "GET",
          path: `/vendors/${id}`,
        });
        return mapVendorStore(unwrapItem(envelope));
      },
      async updateStoreStatus(id, input) {
        const envelope = await transport<LaravelEnvelope<LaravelStoreDto>>({
          method: "PATCH",
          path: `/vendors/${id}/status`,
          body: { status: input.status, reason: input.reason ?? undefined },
        });
        return mapVendorStore(unwrapItem(envelope));
      },
      async updateStoreCommission(id, input) {
        const envelope = await transport<LaravelEnvelope<LaravelStoreDto>>({
          method: "PATCH",
          path: `/vendors/${id}/commission`,
          body: {
            commission_type: input.commissionType,
            commission_value: input.commissionValue,
          },
        });
        return mapVendorStore(unwrapItem(envelope));
      },
      async listStoreCommissions(storeId, query) {
        const envelope = await transport<
          LaravelEnvelope<LaravelCommissionEntryDto>
        >({
          method: "GET",
          path: `/vendors/${storeId}/commissions`,
          query: {
            ...pageQuery(query),
            type: query?.type,
            from: query?.from,
            to: query?.to,
          },
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapCommissionEntry) };
      },
      async storeCommissionSummary(storeId, query) {
        const envelope = await transport<
          LaravelEnvelope<LaravelCommissionSummaryDto>
        >({
          method: "GET",
          path: `/vendors/${storeId}/commissions/summary`,
          query: { from: query?.from, to: query?.to },
        });
        return mapCommissionSummary(unwrapItem(envelope));
      },
      async storeBalance(storeId) {
        const envelope = await transport<
          LaravelEnvelope<LaravelVendorBalanceDto>
        >({
          method: "GET",
          path: `/vendors/${storeId}/balance`,
        });
        return mapVendorBalance(unwrapItem(envelope));
      },
      async adjustStoreBalance(storeId, input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelCommissionEntryDto>
        >({
          method: "POST",
          path: `/vendors/${storeId}/adjustments`,
          body: { amount: input.amount, note: input.note },
        });
        return mapCommissionEntry(unwrapItem(envelope));
      },
      async listLedger(query) {
        const envelope = await transport<
          LaravelEnvelope<LaravelCommissionEntryDto>
        >({
          method: "GET",
          path: "/commissions",
          query: {
            ...pageQuery(query),
            store_id: query?.storeId,
            type: query?.type,
          },
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapCommissionEntry) };
      },
      async listWithdrawals(query) {
        const envelope = await transport<LaravelEnvelope<LaravelWithdrawalDto>>({
          method: "GET",
          path: "/withdrawals",
          query: {
            ...pageQuery(query),
            status: query?.status,
            store_id: query?.storeId,
          },
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapWithdrawal) };
      },
      async getWithdrawal(id) {
        const envelope = await transport<LaravelEnvelope<LaravelWithdrawalDto>>({
          method: "GET",
          path: `/withdrawals/${id}`,
        });
        return mapWithdrawal(unwrapItem(envelope));
      },
      async processWithdrawal(id, input) {
        const envelope = await transport<LaravelEnvelope<LaravelWithdrawalDto>>({
          method: "PATCH",
          path: `/withdrawals/${id}/status`,
          body: { status: input.status, reason: input.reason ?? undefined },
        });
        return mapWithdrawal(unwrapItem(envelope));
      },
    },
    customerGroups: {
      async list(query) {
        const envelope = await transport<
          LaravelEnvelope<LaravelCustomerGroupDto>
        >({
          method: "GET",
          path: "/customer-groups",
          query: {
            ...pageQuery(query),
            q: query?.search,
            active_only: query?.activeOnly,
          },
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapCustomerGroup) };
      },
      async get(id) {
        const envelope = await transport<
          LaravelEnvelope<LaravelCustomerGroupDto>
        >({ method: "GET", path: `/customer-groups/${id}` });
        return mapCustomerGroup(unwrapItem(envelope));
      },
      async create(input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelCustomerGroupDto>
        >({
          method: "POST",
          path: "/customer-groups",
          body: customerGroupBody(input),
        });
        return mapCustomerGroup(unwrapItem(envelope));
      },
      async update(id, input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelCustomerGroupDto>
        >({
          method: "PUT",
          path: `/customer-groups/${id}`,
          body: customerGroupBody(input),
        });
        return mapCustomerGroup(unwrapItem(envelope));
      },
      async delete(id) {
        await transport({ method: "DELETE", path: `/customer-groups/${id}` });
      },
      async listMembers(id, query) {
        const envelope = await transport<LaravelEnvelope<LaravelCustomerDto>>({
          method: "GET",
          path: `/customer-groups/${id}/members`,
          query: pageQuery(query),
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapCustomer) };
      },
      async addMembers(id, customerIds) {
        await transport({
          method: "POST",
          path: `/customer-groups/${id}/members`,
          body: { customer_ids: customerIds },
        });
      },
      async removeMembers(id, customerIds) {
        await transport({
          method: "DELETE",
          path: `/customer-groups/${id}/members`,
          body: { customer_ids: customerIds },
        });
      },
    },
    shipping: {
      async listCarriers(query) {
        const envelope = await transport<
          LaravelEnvelope<LaravelShippingCarrierDto>
        >({ method: "GET", path: "/shipping/carriers", query: pageQuery(query) });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapShippingCarrier) };
      },
      async getCarrier(id) {
        const envelope = await transport<
          LaravelEnvelope<LaravelShippingCarrierDto>
        >({ method: "GET", path: `/shipping/carriers/${id}` });
        return mapShippingCarrier(unwrapItem(envelope));
      },
      async createCarrier(input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelShippingCarrierDto>
        >({
          method: "POST",
          path: "/shipping/carriers",
          body: shippingCarrierBody(input),
        });
        return mapShippingCarrier(unwrapItem(envelope));
      },
      async updateCarrier(id, input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelShippingCarrierDto>
        >({
          method: "PUT",
          path: `/shipping/carriers/${id}`,
          body: shippingCarrierBody(input),
        });
        return mapShippingCarrier(unwrapItem(envelope));
      },
      async deleteCarrier(id) {
        await transport({
          method: "DELETE",
          path: `/shipping/carriers/${id}`,
        });
      },
      async listZones(query) {
        const envelope = await transport<
          LaravelEnvelope<LaravelShippingZoneDto>
        >({ method: "GET", path: "/shipping/zones", query: pageQuery(query) });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapShippingZone) };
      },
      async getZone(id) {
        const envelope = await transport<
          LaravelEnvelope<LaravelShippingZoneDto>
        >({ method: "GET", path: `/shipping/zones/${id}` });
        return mapShippingZone(unwrapItem(envelope));
      },
      async createZone(input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelShippingZoneDto>
        >({
          method: "POST",
          path: "/shipping/zones",
          body: shippingZoneBody(input),
        });
        return mapShippingZone(unwrapItem(envelope));
      },
      async updateZone(id, input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelShippingZoneDto>
        >({
          method: "PUT",
          path: `/shipping/zones/${id}`,
          body: shippingZoneBody(input),
        });
        return mapShippingZone(unwrapItem(envelope));
      },
      async deleteZone(id) {
        await transport({ method: "DELETE", path: `/shipping/zones/${id}` });
      },
      async listMethods(query) {
        const envelope = await transport<
          LaravelEnvelope<LaravelShippingMethodDto>
        >({
          method: "GET",
          path: "/shipping/methods",
          query: {
            ...pageQuery(query),
            shipping_zone_id: query?.zoneId,
            shipping_carrier_id: query?.carrierId,
            rate_type: query?.rateType,
            is_active: query?.isActive,
          },
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapShippingMethod) };
      },
      async getMethod(id) {
        const envelope = await transport<
          LaravelEnvelope<LaravelShippingMethodDto>
        >({ method: "GET", path: `/shipping/methods/${id}` });
        return mapShippingMethod(unwrapItem(envelope));
      },
      async createMethod(input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelShippingMethodDto>
        >({
          method: "POST",
          path: "/shipping/methods",
          body: shippingMethodBody(input),
        });
        return mapShippingMethod(unwrapItem(envelope));
      },
      async updateMethod(id, input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelShippingMethodDto>
        >({
          method: "PUT",
          path: `/shipping/methods/${id}`,
          body: shippingMethodBody(input),
        });
        return mapShippingMethod(unwrapItem(envelope));
      },
      async deleteMethod(id) {
        await transport({ method: "DELETE", path: `/shipping/methods/${id}` });
      },
      async listRates(methodId) {
        const envelope = await transport<
          LaravelEnvelope<LaravelShippingRateDto>
        >({ method: "GET", path: `/shipping/methods/${methodId}/rates` });
        return unwrapItems(envelope).items.map(mapShippingRate);
      },
      async createRate(methodId, input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelShippingRateDto>
        >({
          method: "POST",
          path: `/shipping/methods/${methodId}/rates`,
          body: shippingRateBody(input),
        });
        return mapShippingRate(unwrapItem(envelope));
      },
      async updateRate(methodId, rateId, input) {
        const envelope = await transport<
          LaravelEnvelope<LaravelShippingRateDto>
        >({
          method: "PUT",
          path: `/shipping/methods/${methodId}/rates/${rateId}`,
          body: shippingRateBody(input),
        });
        return mapShippingRate(unwrapItem(envelope));
      },
      async deleteRate(methodId, rateId) {
        await transport({
          method: "DELETE",
          path: `/shipping/methods/${methodId}/rates/${rateId}`,
        });
      },
    },
    shipments: {
      async list(query) {
        const envelope = await transport<LaravelEnvelope<LaravelShipmentDto>>({
          method: "GET",
          path: "/shipments",
          query: {
            ...pageQuery(query),
            status: query?.status,
            order_id: query?.orderId,
            shipping_carrier_id: query?.carrierId,
            q: query?.search,
          },
        });
        const page = unwrapItems(envelope);
        return { ...page, items: page.items.map(mapShipment) };
      },
      async get(id) {
        const envelope = await transport<LaravelEnvelope<LaravelShipmentDto>>({
          method: "GET",
          path: `/shipments/${id}`,
        });
        return mapShipment(unwrapItem(envelope));
      },
      async update(id, input) {
        const envelope = await transport<LaravelEnvelope<LaravelShipmentDto>>({
          method: "PATCH",
          path: `/shipments/${id}`,
          body: {
            shipping_carrier_id: input.carrierId,
            tracking_number: input.trackingNumber,
            note: input.note,
          },
        });
        return mapShipment(unwrapItem(envelope));
      },
      async updateStatus(id, status) {
        const envelope = await transport<LaravelEnvelope<LaravelShipmentDto>>({
          method: "PATCH",
          path: `/shipments/${id}/status`,
          body: { status },
        });
        return mapShipment(unwrapItem(envelope));
      },
      async listForOrder(orderId) {
        const envelope = await transport<LaravelEnvelope<LaravelShipmentDto>>({
          method: "GET",
          path: `/orders/${orderId}/shipments`,
        });
        return unwrapItems(envelope).items.map(mapShipment);
      },
      async fulfillment(orderId) {
        const envelope = await transport<
          LaravelEnvelope<LaravelFulfillmentDto>
        >({ method: "GET", path: `/orders/${orderId}/fulfillment` });
        return mapOrderFulfillment(unwrapItem(envelope));
      },
      async createForOrder(orderId, input) {
        const envelope = await transport<LaravelEnvelope<LaravelShipmentDto>>({
          method: "POST",
          path: `/orders/${orderId}/shipments`,
          body: {
            shipping_carrier_id: input.carrierId ?? undefined,
            tracking_number: input.trackingNumber ?? undefined,
            status: input.status,
            note: input.note ?? undefined,
            items: input.items.map((item) => ({
              order_item_id: item.orderItemId,
              quantity: item.quantity,
            })),
          },
        });
        return mapShipment(unwrapItem(envelope));
      },
    },
    analytics: {
      async dashboard(query) {
        const envelope = await transport<LaravelEnvelope<LaravelDashboardDto>>({
          method: "GET",
          path: "/analytics/dashboard",
          query: {
            start_date: query.startDate,
            end_date: query.endDate,
            granularity: query.granularity,
            recent_orders: query.recentOrders,
            top_products: query.topProducts,
            low_stock: query.lowStock,
          },
        });
        return mapDashboardSnapshot(unwrapItem(envelope));
      },
      async revenueSeries(query) {
        const envelope = await transport<
          LaravelEnvelope<LaravelRevenueSeriesDto>
        >({
          method: "GET",
          path: "/analytics/revenue-series",
          query: {
            start_date: query.startDate,
            end_date: query.endDate,
            granularity: query.granularity,
          },
        });
        return mapRevenueSeries(unwrapItem(envelope));
      },
    },
  };
}
