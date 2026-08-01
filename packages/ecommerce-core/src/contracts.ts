export type Translation = {
  readonly name: string;
  readonly description?: string | null;
};

export type Translations = Readonly<Record<string, Translation>>;
export type PublishStatus = "draft" | "published";

export type Page<T> = {
  readonly items: readonly T[];
  readonly page: number;
  readonly perPage: number;
  readonly total: number;
  readonly lastPage: number;
};

export type PageQuery = {
  readonly page?: number;
  readonly perPage?: number;
};

export type UploadAsset = {
  readonly size: number;
};

export type Product = {
  readonly id: string;
  readonly brandId: string | null;
  readonly parentId: string | null;
  readonly sku: string;
  readonly barcode: string | null;
  readonly slug: string;
  readonly status: PublishStatus;
  readonly featured: boolean;
  readonly variation: boolean;
  readonly configurable: boolean;
  readonly order: number;
  readonly price: number;
  readonly salePrice: number | null;
  readonly saleStartsAt: string | null;
  readonly saleEndsAt: string | null;
  readonly weight: number | null;
  readonly length: number | null;
  readonly width: number | null;
  readonly height: number | null;
  readonly currency: string;
  readonly categoryIds: readonly string[];
  readonly thumbnailUrl: string | null;
  readonly imageUrls: readonly string[];
  readonly translations: Translations;
  readonly name: string;
  readonly description: string | null;
  readonly attributes: readonly ProductAttribute[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProductAttribute = {
  readonly attributeSetId: string;
  readonly attribute: string;
  readonly value?: string;
  readonly values?: readonly string[];
};

export type ProductQuery = PageQuery & {
  readonly search?: string;
  readonly status?: PublishStatus;
  readonly brandId?: string;
  readonly categoryId?: string;
  readonly featured?: boolean;
  readonly sortBy?: "created_at" | "name" | "price";
  readonly sortDirection?: "asc" | "desc";
};

export type SaveProductInput = {
  readonly name: string;
  readonly description?: string | null;
  readonly sku?: string | null;
  readonly barcode?: string | null;
  readonly slug?: string | null;
  readonly brandId?: string | null;
  readonly status: PublishStatus;
  readonly featured?: boolean;
  readonly order?: number;
  readonly price: number;
  readonly salePrice?: number | null;
  readonly saleStartsAt?: string | null;
  readonly saleEndsAt?: string | null;
  readonly weight?: number | null;
  readonly length?: number | null;
  readonly width?: number | null;
  readonly height?: number | null;
  readonly categoryIds?: readonly string[];
  readonly translations?: Translations;
};

export type Category = {
  readonly id: string;
  readonly parentId: string | null;
  readonly slug: string;
  readonly status: PublishStatus;
  readonly order: number;
  readonly featured: boolean;
  readonly imageUrl: string | null;
  readonly translations: Translations;
  readonly name: string;
  readonly description: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type SaveCategoryInput = {
  readonly name: string;
  readonly description?: string | null;
  readonly parentId?: string | null;
  readonly slug?: string | null;
  readonly status: PublishStatus;
  readonly order?: number;
  readonly featured?: boolean;
  readonly translations?: Translations;
};

export type Brand = {
  readonly id: string;
  readonly slug: string;
  readonly website: string | null;
  readonly status: PublishStatus;
  readonly order: number;
  readonly featured: boolean;
  readonly logoUrl: string | null;
  readonly translations: Translations;
  readonly name: string;
  readonly description: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type SaveBrandInput = {
  readonly name: string;
  readonly description?: string | null;
  readonly slug?: string | null;
  readonly website?: string | null;
  readonly status: PublishStatus;
  readonly order?: number;
  readonly featured?: boolean;
  readonly translations?: Translations;
};

export type AttributeValue = {
  readonly id: string;
  readonly attributeSetId: string;
  readonly order: number;
  readonly translations: Translations;
  readonly name: string;
};

export type AttributeSet = {
  readonly id: string;
  readonly code: string;
  readonly order: number;
  readonly translations: Translations;
  readonly name: string;
  readonly values: readonly AttributeValue[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type SaveAttributeSetInput = {
  readonly code: string;
  readonly name: string;
  readonly order?: number;
  readonly translations?: Translations;
};

export type SaveAttributeValueInput = {
  readonly name: string;
  readonly order?: number;
  readonly translations?: Translations;
};

export type SaveVariationInput = {
  readonly attributeValueIds: readonly string[];
  readonly sku?: string | null;
  readonly barcode?: string | null;
  readonly status?: PublishStatus;
  readonly featured?: boolean;
  readonly price: number;
  readonly salePrice?: number | null;
  readonly saleStartsAt?: string | null;
  readonly saleEndsAt?: string | null;
  readonly weight?: number | null;
  readonly length?: number | null;
  readonly width?: number | null;
  readonly height?: number | null;
  readonly name?: string;
  readonly description?: string | null;
  readonly translations?: Translations;
};

export type InventoryStatus =
  "in_stock" | "low_stock" | "out_of_stock" | "backorder";

export type InventoryItem = {
  readonly productId: string;
  readonly sku: string | null;
  readonly productName: string | null;
  readonly onHand: number;
  readonly reserved: number;
  readonly available: number;
  readonly manageStock: boolean;
  readonly allowBackorder: boolean;
  readonly lowStockThreshold: number | null;
  readonly status: InventoryStatus;
  readonly version: number;
  readonly updatedAt: string;
};

export type InventoryQuery = PageQuery & {
  readonly status?: InventoryStatus;
  readonly keyword?: string;
  readonly sku?: string;
  readonly categoryId?: string;
  readonly productStatus?: PublishStatus;
  readonly includeVariations?: boolean;
  readonly productSortBy?: "created_at" | "name" | "price";
  readonly productSortDirection?: "asc" | "desc";
  readonly manageStock?: boolean;
  readonly allowBackorder?: boolean;
  readonly sortBy?:
    "quantity_on_hand" | "quantity_reserved" | "updated_at" | "status";
  readonly sortDirection?: "asc" | "desc";
};

export type InventoryMetrics = {
  readonly totalOnHand: number;
  readonly totalReserved: number;
  readonly totalAvailable: number;
  readonly lowStockCount: number;
  readonly outOfStockCount: number;
  readonly backorderCount: number;
};

export type InventorySettingsInput = {
  readonly manageStock: boolean;
  readonly allowBackorder: boolean;
  readonly lowStockThreshold: number | null;
  readonly expectedVersion: number;
};

export type InventoryMovementInput = {
  readonly delta: number;
  readonly reason: string;
  readonly note?: string | null;
  readonly referenceKey?: string | null;
};

export type StockMovement = {
  readonly id: string;
  readonly productId: string;
  readonly reason: string;
  readonly quantityDelta: number;
  readonly quantityBefore: number;
  readonly quantityAfter: number;
  readonly referenceKey: string | null;
  readonly note: string | null;
  readonly createdBy: string | null;
  readonly createdAt: string;
};

export type MovementReportQuery = PageQuery & {
  readonly productId?: string;
  readonly from?: string;
  readonly to?: string;
};

export type OrderPayment = {
  readonly status: string;
  readonly method: string | null;
  readonly paidAt: string | null;
};

export type OrderItem = {
  readonly id: string;
  readonly productId: string;
  readonly productName: string;
  readonly sku: string | null;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly total: number;
};

export type Order = {
  readonly id: string;
  readonly number: string;
  readonly customerId: string;
  readonly status: string;
  readonly subtotal: number;
  readonly taxAmount: number;
  readonly shippingFee: number;
  readonly discountAmount: number;
  readonly total: number;
  readonly payment: OrderPayment | null;
  readonly items: readonly OrderItem[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type OrderQuery = PageQuery & {
  readonly status?: string;
  readonly paymentStatus?: string;
  readonly customerId?: string;
  readonly from?: string;
  readonly to?: string;
};

export type Refund = {
  readonly id: string;
  readonly amount: number;
  readonly reason: string | null;
  readonly processedAt: string | null;
  readonly createdBy: string | null;
};

export type Review = {
  readonly id: string;
  readonly customerId: string;
  readonly customerName: string;
  readonly productId: string;
  readonly rating: number;
  readonly title: string | null;
  readonly body: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ReviewQuery = PageQuery & {
  readonly status?: string;
  readonly productId?: string;
};

export interface CatalogRepository {
  listProducts(query?: ProductQuery): Promise<Page<Product>>;
  getProduct(id: string): Promise<Product>;
  createProduct(input: SaveProductInput): Promise<Product>;
  updateProduct(id: string, input: Partial<SaveProductInput>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  uploadProductImage(id: string, file: UploadAsset): Promise<Product>;
  deleteProductImage(productId: string, mediaId: string): Promise<void>;
  listVariations(productId: string): Promise<readonly Product[]>;
  createVariations(
    productId: string,
    input: readonly SaveVariationInput[],
  ): Promise<readonly Product[]>;
  deleteVariation(productId: string, variationId: string): Promise<void>;
  listCategories(query?: PageQuery): Promise<Page<Category>>;
  getCategory(id: string): Promise<Category>;
  createCategory(input: SaveCategoryInput): Promise<Category>;
  updateCategory(
    id: string,
    input: Partial<SaveCategoryInput>,
  ): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  uploadCategoryImage(id: string, file: UploadAsset): Promise<Category>;
  listBrands(query?: PageQuery): Promise<Page<Brand>>;
  getBrand(id: string): Promise<Brand>;
  createBrand(input: SaveBrandInput): Promise<Brand>;
  updateBrand(id: string, input: Partial<SaveBrandInput>): Promise<Brand>;
  deleteBrand(id: string): Promise<void>;
  uploadBrandLogo(id: string, file: UploadAsset): Promise<Brand>;
  listAttributeSets(query?: PageQuery): Promise<Page<AttributeSet>>;
  getAttributeSet(id: string): Promise<AttributeSet>;
  createAttributeSet(input: SaveAttributeSetInput): Promise<AttributeSet>;
  updateAttributeSet(
    id: string,
    input: Partial<SaveAttributeSetInput>,
  ): Promise<AttributeSet>;
  deleteAttributeSet(id: string): Promise<void>;
  createAttributeValue(
    attributeSetId: string,
    input: SaveAttributeValueInput,
  ): Promise<AttributeValue>;
  updateAttributeValue(
    attributeSetId: string,
    valueId: string,
    input: Partial<SaveAttributeValueInput>,
  ): Promise<AttributeValue>;
  deleteAttributeValue(attributeSetId: string, valueId: string): Promise<void>;
}

export interface InventoryRepository {
  list(query?: InventoryQuery): Promise<Page<InventoryItem>>;
  metrics(): Promise<InventoryMetrics>;
  get(productId: string): Promise<InventoryItem>;
  updateSettings(
    productId: string,
    input: InventorySettingsInput,
  ): Promise<InventoryItem>;
  applyMovement(
    productId: string,
    input: InventoryMovementInput,
  ): Promise<InventoryItem>;
  movements(productId: string, query?: PageQuery): Promise<Page<StockMovement>>;
  reportMovements(query?: MovementReportQuery): Promise<Page<StockMovement>>;
  reportAdjustments(query?: MovementReportQuery): Promise<Page<StockMovement>>;
  reportLowStock(query?: PageQuery): Promise<Page<InventoryItem>>;
  reportOutOfStock(query?: PageQuery): Promise<Page<InventoryItem>>;
}

export interface OrderRepository {
  list(query?: OrderQuery): Promise<Page<Order>>;
  get(id: string): Promise<Order>;
  updateStatus(id: string, status: string): Promise<Order>;
  markPaid(id: string): Promise<Order>;
  listRefunds(id: string): Promise<readonly Refund[]>;
  createRefund(
    id: string,
    amount: number,
    reason?: string | null,
  ): Promise<Refund>;
}

export interface ReviewRepository {
  list(query?: ReviewQuery): Promise<Page<Review>>;
  approve(id: string): Promise<Review>;
  reject(id: string): Promise<Review>;
}

export type BannerDevice = "desktop" | "tablet" | "phone";

/**
 * Each banner holds one image per device, replaced independently. The backend
 * returns them keyed by device (`{ desktop, tablet, phone }`), with `null` for
 * any device that has no image yet.
 */
export type BannerImageUrls = Readonly<Record<BannerDevice, string | null>>;

export type Banner = {
  readonly id: string;
  readonly linkUrl: string | null;
  readonly status: PublishStatus;
  readonly order: number;
  readonly imageUrls: BannerImageUrls;
  readonly title: string;
  readonly subtitle: string | null;
  readonly buttonText: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type SaveBannerInput = {
  readonly title: string;
  readonly subtitle?: string | null;
  readonly buttonText?: string | null;
  readonly linkUrl?: string | null;
  readonly status?: PublishStatus;
  readonly order?: number;
};

export type StaticPage = {
  readonly id: string;
  readonly slug: string;
  readonly status: PublishStatus;
  readonly title: string;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type SaveStaticPageInput = {
  readonly title: string;
  readonly content: string;
  readonly slug?: string | null;
  readonly status?: PublishStatus;
};

export type FooterLink = {
  readonly id: string;
  readonly group: string;
  readonly url: string;
  readonly order: number;
  readonly status: PublishStatus;
  readonly label: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type SaveFooterLinkInput = {
  readonly group: string;
  readonly url: string;
  readonly label: string;
  readonly order?: number;
  readonly status?: PublishStatus;
};

export type FooterSocial = {
  readonly id: string;
  readonly platform: string;
  readonly url: string;
  readonly order: number;
  readonly status: PublishStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type SaveFooterSocialInput = {
  readonly platform: string;
  readonly url: string;
  readonly order?: number;
  readonly status?: PublishStatus;
};

export type FooterSettings = {
  readonly id: string;
  readonly phone: string | null;
  readonly email: string | null;
  readonly about: string | null;
  readonly address: string | null;
  readonly updatedAt: string;
};

export type SaveFooterSettingsInput = {
  readonly phone?: string | null;
  readonly email?: string | null;
  readonly about?: string | null;
  readonly address?: string | null;
};

export interface CmsRepository {
  listBanners(query?: PageQuery): Promise<Page<Banner>>;
  createBanner(input: SaveBannerInput): Promise<Banner>;
  updateBanner(id: string, input: Partial<SaveBannerInput>): Promise<Banner>;
  deleteBanner(id: string): Promise<void>;
  uploadBannerImage(
    id: string,
    device: BannerDevice,
    file: UploadAsset,
  ): Promise<Banner>;
  listStaticPages(query?: PageQuery): Promise<Page<StaticPage>>;
  createStaticPage(input: SaveStaticPageInput): Promise<StaticPage>;
  updateStaticPage(
    id: string,
    input: Partial<SaveStaticPageInput>,
  ): Promise<StaticPage>;
  deleteStaticPage(id: string): Promise<void>;
  listFooterLinks(query?: PageQuery): Promise<Page<FooterLink>>;
  createFooterLink(input: SaveFooterLinkInput): Promise<FooterLink>;
  updateFooterLink(
    id: string,
    input: Partial<SaveFooterLinkInput>,
  ): Promise<FooterLink>;
  deleteFooterLink(id: string): Promise<void>;
  listFooterSocials(query?: PageQuery): Promise<Page<FooterSocial>>;
  createFooterSocial(input: SaveFooterSocialInput): Promise<FooterSocial>;
  updateFooterSocial(
    id: string,
    input: Partial<SaveFooterSocialInput>,
  ): Promise<FooterSocial>;
  deleteFooterSocial(id: string): Promise<void>;
  getFooterSettings(): Promise<FooterSettings>;
  updateFooterSettings(input: SaveFooterSettingsInput): Promise<FooterSettings>;
}

/* Customers (admin surface: view, detail, reset password) */

export type Customer = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string | null;
  readonly birthdate: string | null;
  readonly isVendor: boolean;
  readonly emailVerifiedAt: string | null;
  readonly phoneVerifiedAt: string | null;
  readonly addressesCount: number | null;
  readonly reviewsCount: number | null;
  readonly wishlistItemsCount: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CustomerQuery = PageQuery & {
  readonly search?: string;
  readonly isVendor?: boolean;
  readonly from?: string;
  readonly to?: string;
};

export interface CustomerRepository {
  list(query?: CustomerQuery): Promise<Page<Customer>>;
  get(id: string): Promise<Customer>;
  resetPassword(id: string, password: string): Promise<Customer>;
}

/* Promotions & discounts (admin) */

export type PromotionType = "automatic" | "coupon";
export type PromotionDiscountType =
  | "percentage"
  | "fixed_amount"
  | "free_shipping";
export type PromotionStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "paused"
  | "expired";

export type PromotionConditionType =
  | "min_spend"
  | "product_ids"
  | "category_ids"
  | "first_order_only"
  | "customer_ids";

export type PromotionCondition = {
  readonly type: PromotionConditionType;
  readonly [key: string]: unknown;
};

export type Promotion = {
  readonly id: string;
  readonly slug: string | null;
  readonly type: PromotionType;
  readonly discountType: PromotionDiscountType;
  readonly discountValue: number | null;
  readonly maxDiscountAmount: number | null;
  readonly conditions: readonly PromotionCondition[];
  readonly priority: number;
  readonly isExclusive: boolean;
  readonly status: PromotionStatus;
  readonly startsAt: string | null;
  readonly endsAt: string | null;
  readonly code: string | null;
  readonly usageLimit: number | null;
  readonly usageLimitPerCustomer: number | null;
  readonly usedCount: number;
  readonly translations: Translations;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type PromotionQuery = PageQuery & {
  readonly type?: PromotionType;
  readonly status?: PromotionStatus;
};

/** Create/update payload. Going live is a separate action (publish), never set here. */
export type SavePromotionInput = {
  readonly slug?: string | null;
  readonly type: PromotionType;
  readonly discountType: PromotionDiscountType;
  readonly discountValue?: number | null;
  readonly maxDiscountAmount?: number | null;
  readonly conditions?: readonly PromotionCondition[];
  readonly priority?: number;
  readonly isExclusive?: boolean;
  readonly status?: Extract<PromotionStatus, "draft" | "scheduled">;
  readonly startsAt?: string | null;
  readonly endsAt?: string | null;
  readonly code?: string | null;
  readonly usageLimit?: number | null;
  readonly usageLimitPerCustomer?: number | null;
  readonly translations: Translations;
};

export type PromotionRedemption = {
  readonly id: string;
  readonly promotionId: string;
  readonly customerId: string | null;
  readonly orderId: string | null;
  readonly discountAmount: number;
  readonly createdAt: string;
};

export interface PromotionRepository {
  list(query?: PromotionQuery): Promise<Page<Promotion>>;
  get(id: string): Promise<Promotion>;
  create(input: SavePromotionInput): Promise<Promotion>;
  update(id: string, input: Partial<SavePromotionInput>): Promise<Promotion>;
  delete(id: string): Promise<void>;
  publish(id: string): Promise<Promotion>;
  pause(id: string): Promise<Promotion>;
  listRedemptions(
    id: string,
    query?: PageQuery,
  ): Promise<Page<PromotionRedemption>>;
}

export type EcommerceCore = {
  readonly catalog: CatalogRepository;
  readonly inventory: InventoryRepository;
  readonly orders: OrderRepository;
  readonly reviews: ReviewRepository;
  readonly cms: CmsRepository;
  readonly customers: CustomerRepository;
  readonly promotions: PromotionRepository;
};
