import type { Translations } from "../contracts";

export type LaravelProductAttributeDto = {
  readonly attribute_set_id: number | string;
  readonly attribute: string;
  readonly value?: string;
  readonly values?: readonly string[];
};

/**
 * A media reference. The public catalog resource returns a bare URL string;
 * the authenticated admin resource returns an object (it carries the media id
 * so images can be deleted individually). Both shapes are accepted and
 * normalized to a URL by `mediaUrl` in `mappers.ts`.
 */
export type LaravelMediaDto = {
  readonly id?: number | string;
  readonly url?: string;
  readonly original_url?: string;
  readonly full_url?: string;
  readonly preview_url?: string;
  readonly thumbnail?: string;
};

export type LaravelMediaRef = string | LaravelMediaDto;

export type LaravelProductDto = {
  readonly id: number | string;
  readonly brand_id: number | string | null;
  readonly parent_id: number | string | null;
  readonly sku: string | null;
  readonly barcode: string | null;
  readonly slug: string | null;
  readonly status: "draft" | "published";
  readonly is_featured: boolean;
  readonly is_variation: boolean;
  readonly is_configurable: boolean;
  readonly order: number;
  readonly price: string | number;
  readonly sale_price: string | number | null;
  readonly sale_starts_at: string | null;
  readonly sale_ends_at: string | null;
  readonly weight: string | number | null;
  readonly length: string | number | null;
  readonly width: string | number | null;
  readonly height: string | number | null;
  readonly currency: string;
  readonly category_ids: readonly (number | string)[];
  readonly thumbnail: LaravelMediaRef | null;
  readonly images: readonly LaravelMediaRef[];
  readonly translations: Translations;
  readonly attributes?: readonly LaravelProductAttributeDto[];
  readonly created_at: string;
  readonly updated_at: string;
};

export type LaravelCategoryDto = {
  readonly id: number | string;
  readonly parent_id: number | string | null;
  readonly slug: string;
  readonly status: "draft" | "published";
  readonly order: number;
  readonly is_featured: boolean;
  readonly image_url: string | null;
  readonly translations: Translations;
  readonly created_at: string;
  readonly updated_at: string;
};

export type LaravelBrandDto = {
  readonly id: number | string;
  readonly slug: string;
  readonly website: string | null;
  readonly status: "draft" | "published";
  readonly order: number;
  readonly is_featured: boolean;
  readonly logo_url: string | null;
  readonly translations: Translations;
  readonly created_at: string;
  readonly updated_at: string;
};

export type LaravelAttributeValueDto = {
  readonly id: number | string;
  readonly attribute_set_id: number | string;
  readonly order: number;
  readonly translations: Translations;
};

export type LaravelAttributeSetDto = {
  readonly id: number | string;
  readonly code: string;
  readonly order: number;
  readonly translations: Translations;
  readonly values: readonly LaravelAttributeValueDto[];
  readonly created_at: string;
  readonly updated_at: string;
};

export type LaravelInventoryItemDto = {
  readonly product_id: number | string;
  readonly sku: string | null;
  readonly product_name: string | null;
  readonly quantity_on_hand: number;
  readonly quantity_reserved: number;
  readonly quantity_available: number;
  readonly manage_stock: boolean;
  readonly allow_backorder: boolean;
  readonly low_stock_threshold: number | null;
  readonly status: "in_stock" | "low_stock" | "out_of_stock" | "backorder";
  readonly version: number;
  readonly updated_at: string;
};

export type LaravelInventoryMetricsDto = {
  readonly total_on_hand: number;
  readonly total_reserved: number;
  readonly total_available: number;
  readonly low_stock_count: number;
  readonly out_of_stock_count: number;
  readonly backorder_count: number;
};

export type LaravelStockMovementDto = {
  readonly id: number | string;
  readonly product_id: number | string;
  readonly reason: string;
  readonly quantity_delta: number;
  readonly quantity_before: number;
  readonly quantity_after: number;
  readonly reference_key: string | null;
  readonly note: string | null;
  readonly created_by: number | string | null;
  readonly created_at: string;
};

export type LaravelOrderItemDto = {
  readonly id: number | string;
  readonly product_id: number | string;
  readonly product_name: string;
  readonly sku: string | null;
  readonly quantity: number;
  readonly unit_price: string | number;
  readonly line_total: string | number;
};

export type LaravelOrderDto = {
  readonly id: number | string;
  readonly order_number: string;
  readonly customer_id: number | string;
  readonly status: string;
  readonly subtotal: string | number;
  readonly tax_amount: string | number;
  readonly shipping_fee: string | number;
  readonly discount_amount: string | number;
  readonly total: string | number;
  readonly payment?: {
    readonly method: string | null;
    readonly status: string;
    readonly paid_at: string | null;
  } | null;
  readonly items?: readonly LaravelOrderItemDto[];
  readonly created_at: string;
  readonly updated_at: string;
};

export type LaravelRefundDto = {
  readonly id: number | string;
  readonly amount: string | number;
  readonly reason: string | null;
  readonly processed_at: string | null;
  readonly created_by: number | string | null;
};

export type LaravelReviewDto = {
  readonly id: number | string;
  readonly customer_id: number | string;
  readonly customer_name: string;
  readonly product_id: number | string;
  readonly rating: number;
  readonly title: string | null;
  readonly body: string;
  readonly status: string;
  readonly created_at: string;
  readonly updated_at: string;
};

export type LaravelCustomerDto = {
  readonly id: number | string;
  readonly name: string;
  readonly email: string;
  readonly phone: string | null;
  readonly birthdate: string | null;
  readonly is_vendor: boolean;
  readonly email_verified_at: string | null;
  readonly phone_verified_at: string | null;
  readonly addresses_count?: number;
  readonly reviews_count?: number;
  readonly wishlist_items_count?: number;
  readonly created_at: string;
  readonly updated_at: string;
};

export type LaravelPromotionDto = {
  readonly id: number | string;
  readonly slug: string | null;
  readonly type: string;
  readonly discount_type: string;
  readonly discount_value: string | number | null;
  readonly max_discount_amount: string | number | null;
  readonly conditions: readonly Record<string, unknown>[] | null;
  readonly priority: number;
  readonly is_exclusive: boolean;
  readonly status: string;
  readonly starts_at: string | null;
  readonly ends_at: string | null;
  readonly code: string | null;
  readonly usage_limit: number | null;
  readonly usage_limit_per_customer: number | null;
  readonly used_count: number;
  readonly translations?: Readonly<
    Record<string, { readonly name: string; readonly description?: string | null }>
  >;
  readonly created_at: string;
  readonly updated_at: string;
};

export type LaravelPromotionRedemptionDto = {
  readonly id: number | string;
  readonly promotion_id: number | string;
  readonly customer_id: number | string | null;
  readonly order_id: number | string | null;
  readonly discount_amount: string | number;
  readonly created_at: string;
};

export type LaravelBannerDto = {
  readonly id: number | string;
  readonly link_url: string | null;
  readonly status: string;
  readonly order: number;
  // Backend returns one image URL per device, keyed by device name
  // (`{ desktop, tablet, phone }`), with `null` where no image is set.
  readonly image_urls: Readonly<Record<string, string | null>>;
  readonly translations: Readonly<
    Record<
      string,
      { title: string; subtitle?: string | null; button_text?: string | null }
    >
  >;
  readonly created_at: string;
  readonly updated_at: string;
};

export type LaravelStaticPageDto = {
  readonly id: number | string;
  readonly slug: string;
  readonly status: string;
  readonly translations: Readonly<
    Record<string, { title: string; content: string }>
  >;
  readonly created_at: string;
  readonly updated_at: string;
};

export type LaravelFooterLinkDto = {
  readonly id: number | string;
  readonly group: string;
  readonly url: string;
  readonly order: number;
  readonly status: string;
  readonly translations: Readonly<Record<string, { label: string }>>;
  readonly created_at: string;
  readonly updated_at: string;
};

export type LaravelFooterSocialDto = {
  readonly id: number | string;
  readonly platform: string;
  readonly url: string;
  readonly order: number;
  readonly status: string;
  readonly created_at: string;
  readonly updated_at: string;
};

export type LaravelFooterSettingDto = {
  readonly id: number | string;
  readonly phone: string | null;
  readonly email: string | null;
  readonly translations: Readonly<
    Record<string, { about?: string | null; address?: string | null }>
  >;
  readonly updated_at: string;
};

export type LaravelNotificationDto = {
  readonly id: number | string;
  readonly type: string;
  readonly title: string;
  readonly body: string;
  readonly data: Readonly<Record<string, unknown>> | null;
  readonly is_read: boolean;
  readonly read_at: string | null;
  readonly created_at: string;
};

export type LaravelBroadcastDto = {
  readonly id: number | string;
  readonly title: string;
  readonly body: string;
  readonly data: Readonly<Record<string, unknown>> | null;
  readonly channels: readonly string[];
  readonly target_type: string;
  readonly target_ids: readonly (number | string)[] | null;
  readonly recipients_count: number;
  readonly delivered_count?: number;
  readonly sent_by?: {
    readonly id: number | string | null;
    readonly name: string | null;
  } | null;
  readonly sent_at: string | null;
  readonly created_at: string;
};

export type LaravelUnreadCountDto = { readonly unread_count: number };
export type LaravelMarkedReadDto = { readonly marked_read: number };

export type LaravelCustomerGroupDto = {
  readonly id: number | string;
  readonly name: string;
  readonly slug: string | null;
  readonly description: string | null;
  readonly is_active: boolean;
  readonly customers_count?: number;
  readonly created_at: string;
  readonly updated_at: string;
};


/* Marketplace — vendor stores, commission ledger, withdrawals (admin) */

export type LaravelStoreDto = {
  readonly id: number | string;
  readonly customer_id: number | string;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly logo_url: string | null;
  readonly contact_email: string | null;
  readonly contact_phone: string | null;
  readonly address_line: string | null;
  readonly city: string | null;
  readonly country_code: string | null;
  readonly status: string;
  readonly is_trading: boolean;
  readonly status_reason: string | null;
  readonly status_changed_at: string | null;
  readonly approved_at: string | null;
  readonly commission_type: string;
  readonly commission_value: number | string;
  readonly created_at: string;
  readonly updated_at: string;
};

export type LaravelCommissionEntryDto = {
  readonly id: number | string;
  readonly type: string;
  readonly order_id: number | string | null;
  readonly order_number: string | null;
  readonly gross_amount: number | string;
  readonly commission_amount: number | string;
  readonly net_amount: number | string;
  readonly commission_type: string | null;
  readonly commission_value: number | string | null;
  readonly withdrawal_id: number | string | null;
  readonly note: string | null;
  readonly created_at: string;
};

export type LaravelVendorBalanceDto = {
  readonly store_id: number | string;
  readonly ledger_balance: number | string;
  readonly on_hold: number | string;
  readonly available: number | string;
  readonly gross_sales: number | string;
  readonly commission_charged: number | string;
  readonly paid_out: number | string;
};

export type LaravelWithdrawalDto = {
  readonly id: number | string;
  readonly reference: string;
  readonly store_id: number | string;
  readonly store_name?: string | null;
  readonly amount: number | string;
  readonly status: string;
  readonly account_holder: string | null;
  readonly account_number: string | null;
  readonly bank_name: string | null;
  readonly note: string | null;
  readonly processed_by: number | string | null;
  readonly requested_at: string | null;
  readonly approved_at: string | null;
  readonly rejected_at: string | null;
  readonly paid_at: string | null;
  readonly cancelled_at: string | null;
  readonly created_at: string;
};
