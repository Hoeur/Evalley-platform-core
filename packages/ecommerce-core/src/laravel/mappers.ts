import type {
  AttributeSet,
  AttributeValue,
  Banner,
  BannerImageUrls,
  Brand,
  Category,
  FooterLink,
  FooterSettings,
  FooterSocial,
  Customer,
  InventoryItem,
  InventoryMetrics,
  Order,
  Product,
  Promotion,
  PromotionCondition,
  PromotionDiscountType,
  PromotionRedemption,
  PromotionStatus,
  PromotionType,
  PublishStatus,
  Refund,
  Review,
  StaticPage,
  StockMovement,
  Translation,
  Translations,
  AdminNotification,
  NotificationBroadcast,
  NotificationChannel,
  NotificationType,
  BroadcastTargetType,
  CustomerGroupSummary,
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
  LaravelInventoryItemDto,
  LaravelInventoryMetricsDto,
  LaravelOrderDto,
  LaravelProductDto,
  LaravelRefundDto,
  LaravelCustomerDto,
  LaravelPromotionDto,
  LaravelPromotionRedemptionDto,
  LaravelReviewDto,
  LaravelStaticPageDto,
  LaravelStockMovementDto,
  LaravelNotificationDto,
  LaravelBroadcastDto,
  LaravelCustomerGroupDto,
} from "./dto";
import type {
  VendorStore,
  CommissionEntry,
  VendorBalance,
  Withdrawal,
  StoreStatus,
  CommissionType,
  LedgerEntryType,
  WithdrawalStatus,
} from "../contracts";
import type {
  LaravelStoreDto,
  LaravelCommissionEntryDto,
  LaravelVendorBalanceDto,
  LaravelWithdrawalDto,
} from "./dto";

import type {
  CustomerGroup,
  ShippingCarrier,
  ShippingZone,
  ShippingRate,
  ShippingMethod,
  ShippingRateType,
  Shipment,
  ShipmentItem,
  ShipmentStatus,
  OrderFulfillment,
  DashboardSnapshot,
  RevenueSeries,
  RevenuePoint,
  AnalyticsTrend,
  CommissionSummary,
} from "../contracts";
import type {
  LaravelShippingCarrierDto,
  LaravelShippingZoneDto,
  LaravelShippingRateDto,
  LaravelShippingMethodDto,
  LaravelShipmentDto,
  LaravelShipmentItemDto,
  LaravelFulfillmentDto,
  LaravelDashboardDto,
  LaravelRevenueSeriesDto,
  LaravelRevenuePointDto,
  LaravelTrendDto,
  LaravelCommissionSummaryDto,
} from "./dto";

function text(value: number | string | null): string | null {
  return value === null ? null : String(value);
}

function money(value: number | string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Resolve a single media reference to its URL string. The public catalog
 * resource serializes images as bare URL strings, but the authenticated admin
 * resource serializes them as media objects (it needs the media id so the admin
 * can delete individual images). Passing an object straight into an `<img src>`
 * renders `[object Object]`, so normalize both shapes to a URL here.
 */
function mediaUrl(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of [
      "url",
      "original_url",
      "full_url",
      "preview_url",
      "src",
      "path",
      "thumbnail",
    ]) {
      const candidate = record[key];
      if (typeof candidate === "string" && candidate) return candidate;
    }
  }
  return "";
}

function mediaId(value: unknown): string {
  if (value && typeof value === "object") {
    const id = (value as Record<string, unknown>).id;
    if (typeof id === "string" || typeof id === "number") return String(id);
  }
  return "";
}

function translated(translations: Translations, locale: string): Translation {
  const preferred = translations[locale];
  if (preferred) return preferred;
  for (const candidate of Object.values(translations)) {
    if (candidate) return candidate;
  }
  return { name: "" };
}

export function mapProduct(dto: LaravelProductDto, locale: string): Product {
  const translation = translated(dto.translations, locale);
  return {
    id: String(dto.id),
    brandId: text(dto.brand_id),
    parentId: text(dto.parent_id),
    sku: dto.sku ?? "",
    barcode: dto.barcode,
    slug: dto.slug ?? "",
    status: dto.status,
    featured: dto.is_featured,
    variation: dto.is_variation,
    configurable: dto.is_configurable,
    order: dto.order,
    price: money(dto.price) ?? 0,
    salePrice: money(dto.sale_price),
    saleStartsAt: dto.sale_starts_at,
    saleEndsAt: dto.sale_ends_at,
    weight: money(dto.weight),
    length: money(dto.length),
    width: money(dto.width),
    height: money(dto.height),
    currency: dto.currency,
    categoryIds: dto.category_ids.map(String),
    thumbnailUrl: mediaUrl(dto.thumbnail) || null,
    imageUrls: (dto.images ?? []).map(mediaUrl).filter(Boolean),
    images: (dto.images ?? [])
      .map((ref) => ({ id: mediaId(ref), url: mediaUrl(ref) }))
      .filter((image) => image.url !== ""),
    translations: dto.translations,
    name: translation.name,
    description: translation.description ?? null,
    attributes: (dto.attributes ?? []).map((attribute) => ({
      attributeSetId: String(attribute.attribute_set_id),
      attribute: attribute.attribute,
      value: attribute.value,
      values: attribute.values,
    })),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapCategory(dto: LaravelCategoryDto, locale: string): Category {
  const translation = translated(dto.translations, locale);
  return {
    id: String(dto.id),
    parentId: text(dto.parent_id),
    slug: dto.slug,
    status: dto.status,
    order: dto.order,
    featured: dto.is_featured,
    imageUrl: dto.image_url,
    translations: dto.translations,
    name: translation.name,
    description: translation.description ?? null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapBrand(dto: LaravelBrandDto, locale: string): Brand {
  const translation = translated(dto.translations, locale);
  return {
    id: String(dto.id),
    slug: dto.slug,
    website: dto.website,
    status: dto.status,
    order: dto.order,
    featured: dto.is_featured,
    logoUrl: dto.logo_url,
    translations: dto.translations,
    name: translation.name,
    description: translation.description ?? null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapAttributeValue(
  dto: LaravelAttributeValueDto,
  locale: string,
): AttributeValue {
  return {
    id: String(dto.id),
    attributeSetId: String(dto.attribute_set_id),
    order: dto.order,
    translations: dto.translations,
    name: translated(dto.translations, locale).name,
  };
}

export function mapAttributeSet(
  dto: LaravelAttributeSetDto,
  locale: string,
): AttributeSet {
  return {
    id: String(dto.id),
    code: dto.code,
    order: dto.order,
    translations: dto.translations,
    name: translated(dto.translations, locale).name,
    values: dto.values.map((value) => mapAttributeValue(value, locale)),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapInventoryItem(dto: LaravelInventoryItemDto): InventoryItem {
  return {
    productId: String(dto.product_id),
    sku: dto.sku,
    productName: dto.product_name,
    onHand: dto.quantity_on_hand,
    reserved: dto.quantity_reserved,
    available: dto.quantity_available,
    manageStock: dto.manage_stock,
    allowBackorder: dto.allow_backorder,
    lowStockThreshold: dto.low_stock_threshold,
    status: dto.status,
    version: dto.version,
    updatedAt: dto.updated_at,
  };
}

export function mapInventoryMetrics(
  dto: LaravelInventoryMetricsDto,
): InventoryMetrics {
  return {
    totalOnHand: dto.total_on_hand,
    totalReserved: dto.total_reserved,
    totalAvailable: dto.total_available,
    lowStockCount: dto.low_stock_count,
    outOfStockCount: dto.out_of_stock_count,
    backorderCount: dto.backorder_count,
  };
}

export function mapStockMovement(dto: LaravelStockMovementDto): StockMovement {
  return {
    id: String(dto.id),
    productId: String(dto.product_id),
    reason: dto.reason,
    quantityDelta: dto.quantity_delta,
    quantityBefore: dto.quantity_before,
    quantityAfter: dto.quantity_after,
    referenceKey: dto.reference_key,
    note: dto.note,
    createdBy: text(dto.created_by),
    createdAt: dto.created_at,
  };
}

export function mapOrder(dto: LaravelOrderDto): Order {
  return {
    id: String(dto.id),
    number: dto.order_number,
    customerId: String(dto.customer_id),
    status: dto.status,
    subtotal: money(dto.subtotal) ?? 0,
    taxAmount: money(dto.tax_amount) ?? 0,
    shippingFee: money(dto.shipping_fee) ?? 0,
    discountAmount: money(dto.discount_amount) ?? 0,
    total: money(dto.total) ?? 0,
    payment: dto.payment
      ? {
          method: dto.payment.method,
          status: dto.payment.status,
          paidAt: dto.payment.paid_at,
        }
      : null,
    items: (dto.items ?? []).map((item) => ({
      id: String(item.id),
      productId: String(item.product_id),
      productName: item.product_name,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: money(item.unit_price) ?? 0,
      total: money(item.line_total) ?? 0,
    })),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapRefund(dto: LaravelRefundDto): Refund {
  return {
    id: String(dto.id),
    amount: money(dto.amount) ?? 0,
    reason: dto.reason,
    processedAt: dto.processed_at,
    createdBy: text(dto.created_by),
  };
}

export function mapReview(dto: LaravelReviewDto): Review {
  return {
    id: String(dto.id),
    customerId: String(dto.customer_id),
    customerName: dto.customer_name,
    productId: String(dto.product_id),
    rating: dto.rating,
    title: dto.title,
    body: dto.body,
    status: dto.status,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

function pickLocale<T>(
  translations: Readonly<Record<string, T>> | undefined,
  locale: string,
): Partial<T> {
  return (translations?.[locale] ??
    Object.values(translations ?? {})[0] ??
    {}) as Partial<T>;
}

function mapBannerImageUrls(
  raw: LaravelBannerDto["image_urls"],
): BannerImageUrls {
  const source = (raw ?? {}) as Record<string, string | null>;
  return {
    desktop: source.desktop ?? null,
    tablet: source.tablet ?? null,
    phone: source.phone ?? null,
  };
}

export function mapBanner(dto: LaravelBannerDto, locale: string): Banner {
  const t = pickLocale(dto.translations, locale);
  return {
    id: String(dto.id),
    linkUrl: dto.link_url,
    status: dto.status as PublishStatus,
    order: dto.order,
    imageUrls: mapBannerImageUrls(dto.image_urls),
    title: t.title ?? "",
    subtitle: t.subtitle ?? null,
    buttonText: t.button_text ?? null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapStaticPage(
  dto: LaravelStaticPageDto,
  locale: string,
): StaticPage {
  const t = pickLocale(dto.translations, locale);
  return {
    id: String(dto.id),
    slug: dto.slug,
    status: dto.status as PublishStatus,
    title: t.title ?? "",
    content: t.content ?? "",
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapFooterLink(
  dto: LaravelFooterLinkDto,
  locale: string,
): FooterLink {
  const t = pickLocale(dto.translations, locale);
  return {
    id: String(dto.id),
    group: dto.group,
    url: dto.url,
    order: dto.order,
    status: dto.status as PublishStatus,
    label: t.label ?? "",
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapFooterSocial(dto: LaravelFooterSocialDto): FooterSocial {
  return {
    id: String(dto.id),
    platform: dto.platform,
    url: dto.url,
    order: dto.order,
    status: dto.status as PublishStatus,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapFooterSettings(
  dto: LaravelFooterSettingDto,
  locale: string,
): FooterSettings {
  const t = pickLocale(dto.translations, locale);
  return {
    id: String(dto.id),
    phone: dto.phone,
    email: dto.email,
    about: t.about ?? null,
    address: t.address ?? null,
    updatedAt: dto.updated_at,
  };
}

export function mapCustomer(dto: LaravelCustomerDto): Customer {
  return {
    id: String(dto.id),
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    birthdate: dto.birthdate,
    isVendor: Boolean(dto.is_vendor),
    emailVerifiedAt: dto.email_verified_at,
    phoneVerifiedAt: dto.phone_verified_at,
    addressesCount: dto.addresses_count ?? null,
    reviewsCount: dto.reviews_count ?? null,
    wishlistItemsCount: dto.wishlist_items_count ?? null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapPromotion(dto: LaravelPromotionDto): Promotion {
  const translations: Record<string, Translation> = {};
  for (const [locale, value] of Object.entries(dto.translations ?? {})) {
    translations[locale] = { name: value.name, description: value.description ?? null };
  }
  return {
    id: String(dto.id),
    slug: dto.slug,
    type: dto.type as PromotionType,
    discountType: dto.discount_type as PromotionDiscountType,
    discountValue: money(dto.discount_value),
    maxDiscountAmount: money(dto.max_discount_amount),
    conditions: (dto.conditions ?? []) as readonly PromotionCondition[],
    priority: dto.priority,
    isExclusive: Boolean(dto.is_exclusive),
    status: dto.status as PromotionStatus,
    startsAt: dto.starts_at,
    endsAt: dto.ends_at,
    code: dto.code,
    usageLimit: dto.usage_limit,
    usageLimitPerCustomer: dto.usage_limit_per_customer,
    usedCount: dto.used_count,
    translations: translations as Translations,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapPromotionRedemption(
  dto: LaravelPromotionRedemptionDto,
): PromotionRedemption {
  return {
    id: String(dto.id),
    promotionId: String(dto.promotion_id),
    customerId: text(dto.customer_id),
    orderId: text(dto.order_id),
    discountAmount: money(dto.discount_amount) ?? 0,
    createdAt: dto.created_at,
  };
}

export function mapAdminNotification(
  dto: LaravelNotificationDto,
): AdminNotification {
  return {
    id: String(dto.id),
    type: dto.type as NotificationType,
    title: dto.title,
    body: dto.body,
    data: (dto.data ?? {}) as Readonly<Record<string, unknown>>,
    isRead: Boolean(dto.is_read),
    readAt: dto.read_at,
    createdAt: dto.created_at,
  };
}

export function mapNotificationBroadcast(
  dto: LaravelBroadcastDto,
): NotificationBroadcast {
  return {
    id: String(dto.id),
    title: dto.title,
    body: dto.body,
    data: (dto.data ?? {}) as Readonly<Record<string, unknown>>,
    channels: (dto.channels ?? []) as readonly NotificationChannel[],
    targetType: dto.target_type as BroadcastTargetType,
    targetIds: (dto.target_ids ?? []).map(String),
    recipientsCount: dto.recipients_count,
    deliveredCount: dto.delivered_count ?? null,
    sentBy: dto.sent_by
      ? {
          id: dto.sent_by.id === null ? null : String(dto.sent_by.id),
          name: dto.sent_by.name,
        }
      : null,
    sentAt: dto.sent_at,
    createdAt: dto.created_at,
  };
}

export function mapCustomerGroupSummary(
  dto: LaravelCustomerGroupDto,
): CustomerGroupSummary {
  return {
    id: String(dto.id),
    name: dto.name,
    slug: dto.slug,
    description: dto.description,
    isActive: Boolean(dto.is_active),
    customersCount: dto.customers_count ?? null,
  };
}


export function mapVendorStore(dto: LaravelStoreDto): VendorStore {
  return {
    id: String(dto.id),
    customerId: String(dto.customer_id),
    name: dto.name,
    slug: dto.slug,
    description: dto.description,
    logoUrl: dto.logo_url,
    contactEmail: dto.contact_email,
    contactPhone: dto.contact_phone,
    addressLine: dto.address_line,
    city: dto.city,
    countryCode: dto.country_code,
    status: dto.status as StoreStatus,
    isTrading: Boolean(dto.is_trading),
    statusReason: dto.status_reason,
    statusChangedAt: dto.status_changed_at,
    approvedAt: dto.approved_at,
    commissionType: dto.commission_type as CommissionType,
    commissionValue: money(dto.commission_value) ?? 0,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapCommissionEntry(
  dto: LaravelCommissionEntryDto,
): CommissionEntry {
  return {
    id: String(dto.id),
    type: dto.type as LedgerEntryType,
    orderId: text(dto.order_id),
    orderNumber: dto.order_number,
    grossAmount: money(dto.gross_amount) ?? 0,
    commissionAmount: money(dto.commission_amount) ?? 0,
    netAmount: money(dto.net_amount) ?? 0,
    commissionType: (dto.commission_type as CommissionType | null) ?? null,
    commissionValue: money(dto.commission_value),
    withdrawalId: text(dto.withdrawal_id),
    note: dto.note,
    createdAt: dto.created_at,
  };
}

export function mapVendorBalance(dto: LaravelVendorBalanceDto): VendorBalance {
  return {
    storeId: String(dto.store_id),
    ledgerBalance: money(dto.ledger_balance) ?? 0,
    onHold: money(dto.on_hold) ?? 0,
    available: money(dto.available) ?? 0,
    grossSales: money(dto.gross_sales) ?? 0,
    commissionCharged: money(dto.commission_charged) ?? 0,
    paidOut: money(dto.paid_out) ?? 0,
  };
}

export function mapWithdrawal(dto: LaravelWithdrawalDto): Withdrawal {
  return {
    id: String(dto.id),
    reference: dto.reference,
    storeId: String(dto.store_id),
    storeName: dto.store_name ?? null,
    amount: money(dto.amount) ?? 0,
    status: dto.status as WithdrawalStatus,
    accountHolder: dto.account_holder,
    accountNumber: dto.account_number,
    bankName: dto.bank_name,
    note: dto.note,
    processedBy: text(dto.processed_by),
    requestedAt: dto.requested_at,
    approvedAt: dto.approved_at,
    rejectedAt: dto.rejected_at,
    paidAt: dto.paid_at,
    cancelledAt: dto.cancelled_at,
    createdAt: dto.created_at,
  };
}

export function mapCustomerGroup(dto: LaravelCustomerGroupDto): CustomerGroup {
  return {
    id: String(dto.id),
    name: dto.name,
    slug: dto.slug,
    description: dto.description,
    isActive: Boolean(dto.is_active),
    customersCount: dto.customers_count ?? null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapShippingCarrier(
  dto: LaravelShippingCarrierDto,
): ShippingCarrier {
  return {
    id: String(dto.id),
    name: dto.name,
    code: dto.code,
    trackingUrlTemplate: dto.tracking_url_template,
    phone: dto.phone,
    website: dto.website,
    isActive: Boolean(dto.is_active),
    order: dto.order,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapShippingZone(dto: LaravelShippingZoneDto): ShippingZone {
  return {
    id: String(dto.id),
    name: dto.name,
    countryCodes: (dto.country_codes ?? []).map(String),
    states: (dto.states ?? []).map(String),
    priority: dto.priority,
    isActive: Boolean(dto.is_active),
    methodsCount: dto.methods_count ?? null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapShippingRate(dto: LaravelShippingRateDto): ShippingRate {
  return {
    id: String(dto.id),
    shippingMethodId: String(dto.shipping_method_id),
    minValue: money(dto.min_value) ?? 0,
    maxValue: money(dto.max_value),
    price: money(dto.price) ?? 0,
  };
}

export function mapShippingMethod(
  dto: LaravelShippingMethodDto,
): ShippingMethod {
  const translations: Record<string, Translation> = {};
  for (const [locale, value] of Object.entries(dto.translations ?? {})) {
    translations[locale] = {
      name: value.name,
      description: value.description ?? null,
    };
  }
  return {
    id: String(dto.id),
    zoneId: String(dto.shipping_zone_id),
    carrierId: text(dto.shipping_carrier_id),
    code: dto.code,
    rateType: dto.rate_type as ShippingRateType,
    baseRate: money(dto.base_rate) ?? 0,
    freeOverAmount: money(dto.free_over_amount),
    minDeliveryDays: dto.min_delivery_days,
    maxDeliveryDays: dto.max_delivery_days,
    isActive: Boolean(dto.is_active),
    order: dto.order,
    name: dto.name ?? "",
    description: dto.description ?? null,
    translations: translations as Translations,
    carrier: dto.carrier ? mapShippingCarrier(dto.carrier) : null,
    rates: (dto.rates ?? []).map(mapShippingRate),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapShipmentItem(dto: LaravelShipmentItemDto): ShipmentItem {
  return {
    id: String(dto.id),
    orderItemId: String(dto.order_item_id),
    quantity: dto.quantity,
    productId:
      dto.product_id === undefined || dto.product_id === null
        ? null
        : String(dto.product_id),
    productName: dto.product_name ?? null,
    sku: dto.sku ?? null,
    variantAttributes: dto.variant_attributes ?? null,
  };
}

export function mapShipment(dto: LaravelShipmentDto): Shipment {
  return {
    id: String(dto.id),
    orderId: String(dto.order_id),
    orderNumber: dto.order_number ?? null,
    shipmentNumber: dto.shipment_number,
    carrierId: text(dto.shipping_carrier_id),
    carrierName: dto.carrier_name,
    trackingNumber: dto.tracking_number,
    trackingUrl: dto.tracking_url,
    status: dto.status as ShipmentStatus,
    note: dto.note,
    items: (dto.items ?? []).map(mapShipmentItem),
    shippedAt: dto.shipped_at,
    deliveredAt: dto.delivered_at,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapOrderFulfillment(
  dto: LaravelFulfillmentDto,
): OrderFulfillment {
  return {
    orderId: String(dto.order_id),
    orderNumber: dto.order_number,
    status: dto.status,
    items: (dto.items ?? []).map((line) => ({
      orderItemId: String(line.order_item_id),
      productId: text(line.product_id),
      productName: line.product_name,
      sku: line.sku,
      variantAttributes: line.variant_attributes ?? null,
      quantityOrdered: line.quantity_ordered,
      quantityShipped: line.quantity_shipped,
      quantityRemaining: line.quantity_remaining,
    })),
  };
}

function mapTrend(dto: LaravelTrendDto): AnalyticsTrend {
  return {
    value: money(dto.value) ?? 0,
    previousValue: money(dto.previous_value) ?? 0,
    changePercent:
      dto.change_percent === null ? null : money(dto.change_percent),
    direction: dto.direction,
    isImprovement: Boolean(dto.is_improvement),
  };
}

function mapRevenuePoint(dto: LaravelRevenuePointDto): RevenuePoint {
  return {
    bucket: dto.bucket,
    label: dto.label,
    revenue: money(dto.revenue) ?? 0,
    orders: dto.orders,
  };
}

export function mapDashboardSnapshot(
  dto: LaravelDashboardDto,
): DashboardSnapshot {
  const summarySource = dto.summary ?? {};
  const emptyTrend: AnalyticsTrend = {
    value: 0,
    previousValue: 0,
    changePercent: null,
    direction: "flat",
    isImprovement: false,
  };
  const trend = (key: string): AnalyticsTrend =>
    summarySource[key] ? mapTrend(summarySource[key]) : emptyTrend;
  return {
    range: {
      startDate: dto.range.start_date,
      endDate: dto.range.end_date,
      days: dto.range.days,
      label: dto.range.label,
      granularity: dto.range.granularity,
    },
    currency: dto.currency,
    summary: {
      revenue: trend("revenue"),
      orders: trend("orders"),
      newCustomers: trend("new_customers"),
      refundRate: trend("refund_rate"),
    },
    revenueSeries: (dto.revenue_series?.points ?? []).map(mapRevenuePoint),
    orderStatus: {
      total: dto.order_status?.total ?? 0,
      slices: (dto.order_status?.slices ?? []).map((slice) => ({
        status: slice.status,
        label: slice.label,
        count: slice.count,
        percentage: money(slice.percentage) ?? 0,
      })),
    },
    recentOrders: (dto.recent_orders ?? []).map((order) => ({
      id: String(order.id),
      orderNumber: order.order_number,
      customerId: String(order.customer_id),
      status: order.status,
      paymentStatus: order.payment_status,
      total: money(order.total) ?? 0,
    })),
    topProducts: (dto.top_products ?? []).map((product) => ({
      productId: String(product.product_id),
      name: product.name,
      imageUrl: product.image_url,
      unitsSold: product.units_sold,
      revenue: money(product.revenue) ?? 0,
    })),
    lowStock: {
      total: dto.low_stock?.total ?? 0,
      items: (dto.low_stock?.items ?? []).map((item) => ({
        productId: String(item.product_id),
        name: item.name,
        sku: item.sku,
        quantityAvailable: item.quantity_available,
        status: item.status,
      })),
    },
  };
}

export function mapRevenueSeries(dto: LaravelRevenueSeriesDto): RevenueSeries {
  return {
    granularity: dto.granularity,
    points: (dto.points ?? []).map(mapRevenuePoint),
  };
}

export function mapCommissionSummary(
  dto: LaravelCommissionSummaryDto,
): CommissionSummary {
  const byType: Record<string, { count: number; net: number }> = {};
  for (const [key, value] of Object.entries(dto.by_type ?? {})) {
    byType[key] = { count: value.count, net: money(value.net) ?? 0 };
  }
  return {
    from: dto.from,
    to: dto.to,
    grossSales: money(dto.gross_sales) ?? 0,
    commissionCharged: money(dto.commission_charged) ?? 0,
    netMovement: money(dto.net_movement) ?? 0,
    byType,
  };
}
