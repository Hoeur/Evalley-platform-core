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
} from "./dto";

function text(value: number | string | null): string | null {
  return value === null ? null : String(value);
}

function money(value: number | string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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
    thumbnailUrl: dto.thumbnail,
    imageUrls: dto.images,
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
