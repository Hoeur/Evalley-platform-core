import type { Translations } from "../contracts";

export type LaravelProductAttributeDto = {
  readonly attribute_set_id: number | string;
  readonly attribute: string;
  readonly value?: string;
  readonly values?: readonly string[];
};

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
  readonly thumbnail: string | null;
  readonly images: readonly string[];
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
