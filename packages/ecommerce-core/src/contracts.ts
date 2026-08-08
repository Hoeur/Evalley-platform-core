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

export type ProductImage = {
  readonly id: string;
  readonly url: string;
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
  readonly images?: readonly ProductImage[];
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
  deleteCategoryImage(id: string): Promise<void>;
  listBrands(query?: PageQuery): Promise<Page<Brand>>;
  getBrand(id: string): Promise<Brand>;
  createBrand(input: SaveBrandInput): Promise<Brand>;
  updateBrand(id: string, input: Partial<SaveBrandInput>): Promise<Brand>;
  deleteBrand(id: string): Promise<void>;
  uploadBrandLogo(id: string, file: UploadAsset): Promise<Brand>;
  deleteBrandLogo(id: string): Promise<void>;
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
  deleteBannerImage(id: string, device: BannerDevice): Promise<void>;
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

/** Admin edit of a customer's profile. Status changes go through suspend/activate. */
export type SaveCustomerInput = {
  readonly name?: string;
  readonly email?: string | null;
  readonly phone?: string | null;
  readonly birthdate?: string | null;
};

export interface CustomerRepository {
  list(query?: CustomerQuery): Promise<Page<Customer>>;
  get(id: string): Promise<Customer>;
  update(id: string, input: SaveCustomerInput): Promise<Customer>;
  delete(id: string): Promise<void>;
  suspend(id: string, reason?: string | null): Promise<Customer>;
  activate(id: string): Promise<Customer>;
  resetPassword(id: string, password: string): Promise<Customer>;
}

/* Customer groups (admin: full CRUD + membership) */

export type CustomerGroup = {
  readonly id: string;
  readonly name: string;
  readonly slug: string | null;
  readonly description: string | null;
  readonly isActive: boolean;
  readonly customersCount: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type SaveCustomerGroupInput = {
  readonly name: string;
  readonly slug?: string | null;
  readonly description?: string | null;
  readonly isActive?: boolean;
};

export interface CustomerGroupRepository {
  list(query?: CustomerGroupQuery): Promise<Page<CustomerGroup>>;
  get(id: string): Promise<CustomerGroup>;
  create(input: SaveCustomerGroupInput): Promise<CustomerGroup>;
  update(
    id: string,
    input: Partial<SaveCustomerGroupInput>,
  ): Promise<CustomerGroup>;
  delete(id: string): Promise<void>;
  listMembers(id: string, query?: PageQuery): Promise<Page<Customer>>;
  addMembers(id: string, customerIds: readonly string[]): Promise<void>;
  removeMembers(id: string, customerIds: readonly string[]): Promise<void>;
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

/* Notifications — admin inbox + customer broadcasts */

export type NotificationType =
  | "order.placed"
  | "order.status_changed"
  | "order.paid"
  | "order.cancelled"
  | "order.refunded"
  | "review.approved"
  | "review.rejected"
  | "stock.low"
  | "stock.out"
  | "admin.broadcast";

export type NotificationChannel = "in_app" | "mail" | "telegram" | "fcm";
export type BroadcastTargetType = "all" | "customers" | "groups";

export type AdminNotification = {
  readonly id: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly body: string;
  readonly data: Readonly<Record<string, unknown>>;
  readonly isRead: boolean;
  readonly readAt: string | null;
  readonly createdAt: string;
};

export type NotificationQuery = PageQuery & {
  readonly unreadOnly?: boolean;
};

export type NotificationBroadcast = {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly data: Readonly<Record<string, unknown>>;
  readonly channels: readonly NotificationChannel[];
  readonly targetType: BroadcastTargetType;
  readonly targetIds: readonly string[];
  readonly recipientsCount: number;
  // Lags recipientsCount while the notifications queue drains; null until the
  // API reports a count (the create response does not include one).
  readonly deliveredCount: number | null;
  readonly sentBy: {
    readonly id: string | null;
    readonly name: string | null;
  } | null;
  readonly sentAt: string | null;
  readonly createdAt: string;
};

export type SendBroadcastInput = {
  readonly title: string;
  readonly body: string;
  readonly targetType: BroadcastTargetType;
  readonly customerIds?: readonly string[];
  readonly groupIds?: readonly string[];
  readonly channels: readonly NotificationChannel[];
  readonly data?: Readonly<Record<string, unknown>>;
};

export type CustomerGroupSummary = {
  readonly id: string;
  readonly name: string;
  readonly slug: string | null;
  readonly description: string | null;
  readonly isActive: boolean;
  readonly customersCount: number | null;
};

export type CustomerGroupQuery = PageQuery & {
  readonly search?: string;
  readonly activeOnly?: boolean;
};

export interface NotificationRepository {
  listInbox(query?: NotificationQuery): Promise<Page<AdminNotification>>;
  unreadCount(): Promise<number>;
  markRead(id: string): Promise<AdminNotification>;
  markAllRead(): Promise<number>;
  delete(id: string): Promise<void>;
  listBroadcasts(query?: PageQuery): Promise<Page<NotificationBroadcast>>;
  getBroadcast(id: string): Promise<NotificationBroadcast>;
  sendBroadcast(input: SendBroadcastInput): Promise<NotificationBroadcast>;
  listCustomerGroups(
    query?: CustomerGroupQuery,
  ): Promise<Page<CustomerGroupSummary>>;
}

/* Marketplace — vendors (stores), commission ledger, withdrawals (admin) */

export type StoreStatus =
  | "pending"
  | "approved"
  | "suspended"
  | "rejected"
  | "deactivated";

export type CommissionType = "percentage" | "fixed_amount";

export type LedgerEntryType =
  | "accrued"
  | "reversal"
  | "partial_reversal"
  | "adjustment"
  | "payout";

export type WithdrawalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "paid"
  | "cancelled";

export type VendorStore = {
  readonly id: string;
  readonly customerId: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly logoUrl: string | null;
  readonly contactEmail: string | null;
  readonly contactPhone: string | null;
  readonly addressLine: string | null;
  readonly city: string | null;
  readonly countryCode: string | null;
  readonly status: StoreStatus;
  readonly isTrading: boolean;
  readonly statusReason: string | null;
  readonly statusChangedAt: string | null;
  readonly approvedAt: string | null;
  readonly commissionType: CommissionType;
  readonly commissionValue: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type VendorStoreQuery = PageQuery & {
  readonly status?: StoreStatus;
  readonly search?: string;
};

export type UpdateStoreStatusInput = {
  readonly status: StoreStatus;
  readonly reason?: string | null;
};

export type UpdateCommissionInput = {
  readonly commissionType: CommissionType;
  readonly commissionValue: number;
};

/**
 * One row of the append-only commission ledger. Amounts are signed: a
 * positive net credits the vendor, a negative one (reversal, payout, or a
 * debit adjustment) reduces the balance. commissionType/commissionValue are
 * the rate frozen at accrual time, not the store's current terms.
 */
export type CommissionEntry = {
  readonly id: string;
  readonly type: LedgerEntryType;
  readonly orderId: string | null;
  readonly orderNumber: string | null;
  readonly grossAmount: number;
  readonly commissionAmount: number;
  readonly netAmount: number;
  readonly commissionType: CommissionType | null;
  readonly commissionValue: number | null;
  readonly withdrawalId: string | null;
  readonly note: string | null;
  readonly createdAt: string;
};

export type CommissionQuery = PageQuery & {
  readonly type?: LedgerEntryType;
  readonly from?: string;
  readonly to?: string;
};

export type LedgerQuery = PageQuery & {
  readonly storeId?: string;
  readonly type?: LedgerEntryType;
};

export type CommissionSummaryEntry = {
  readonly count: number;
  readonly net: number;
};

/** Window totals for one store's ledger — the header a statement is read under. */
export type CommissionSummary = {
  readonly from: string;
  readonly to: string;
  readonly grossSales: number;
  readonly commissionCharged: number;
  readonly netMovement: number;
  readonly byType: Readonly<Record<string, CommissionSummaryEntry>>;
};

export type CommissionSummaryQuery = {
  readonly from?: string;
  readonly to?: string;
};

/** A store's money position, recomputed from the ledger on every read. */
export type VendorBalance = {
  readonly storeId: string;
  readonly ledgerBalance: number;
  readonly onHold: number;
  readonly available: number;
  readonly grossSales: number;
  readonly commissionCharged: number;
  readonly paidOut: number;
};

export type AdjustmentInput = {
  readonly amount: number;
  readonly note: string;
};

export type Withdrawal = {
  readonly id: string;
  readonly reference: string;
  readonly storeId: string;
  readonly storeName: string | null;
  readonly amount: number;
  readonly status: WithdrawalStatus;
  readonly accountHolder: string | null;
  readonly accountNumber: string | null;
  readonly bankName: string | null;
  readonly note: string | null;
  readonly processedBy: string | null;
  readonly requestedAt: string | null;
  readonly approvedAt: string | null;
  readonly rejectedAt: string | null;
  readonly paidAt: string | null;
  readonly cancelledAt: string | null;
  readonly createdAt: string;
};

export type WithdrawalQuery = PageQuery & {
  readonly status?: WithdrawalStatus;
  readonly storeId?: string;
};

/** Admin may only move a withdrawal to one of these three states. */
export type ProcessWithdrawalInput = {
  readonly status: Extract<WithdrawalStatus, "approved" | "rejected" | "paid">;
  readonly reason?: string | null;
};

export interface VendorRepository {
  listStores(query?: VendorStoreQuery): Promise<Page<VendorStore>>;
  getStore(id: string): Promise<VendorStore>;
  updateStoreStatus(
    id: string,
    input: UpdateStoreStatusInput,
  ): Promise<VendorStore>;
  updateStoreCommission(
    id: string,
    input: UpdateCommissionInput,
  ): Promise<VendorStore>;
  listStoreCommissions(
    storeId: string,
    query?: CommissionQuery,
  ): Promise<Page<CommissionEntry>>;
  storeCommissionSummary(
    storeId: string,
    query?: CommissionSummaryQuery,
  ): Promise<CommissionSummary>;
  storeBalance(storeId: string): Promise<VendorBalance>;
  adjustStoreBalance(
    storeId: string,
    input: AdjustmentInput,
  ): Promise<CommissionEntry>;
  listLedger(query?: LedgerQuery): Promise<Page<CommissionEntry>>;
  listWithdrawals(query?: WithdrawalQuery): Promise<Page<Withdrawal>>;
  getWithdrawal(id: string): Promise<Withdrawal>;
  processWithdrawal(
    id: string,
    input: ProcessWithdrawalInput,
  ): Promise<Withdrawal>;
}

/* Shipping configuration — carriers, zones, methods, rates (admin) */

export type ShippingRateType = "flat" | "weight" | "price" | "free";

export type ShippingCarrier = {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly trackingUrlTemplate: string | null;
  readonly phone: string | null;
  readonly website: string | null;
  readonly isActive: boolean;
  readonly order: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type SaveShippingCarrierInput = {
  readonly name: string;
  readonly code: string;
  readonly trackingUrlTemplate?: string | null;
  readonly phone?: string | null;
  readonly website?: string | null;
  readonly isActive?: boolean;
  readonly order?: number;
};

export type ShippingZone = {
  readonly id: string;
  readonly name: string;
  readonly countryCodes: readonly string[];
  readonly states: readonly string[];
  readonly priority: number;
  readonly isActive: boolean;
  readonly methodsCount: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type SaveShippingZoneInput = {
  readonly name: string;
  readonly countryCodes: readonly string[];
  readonly states?: readonly string[];
  readonly priority?: number;
  readonly isActive?: boolean;
};

/** A table-rate tier. `price` and value thresholds are in major units. */
export type ShippingRate = {
  readonly id: string;
  readonly shippingMethodId: string;
  readonly minValue: number;
  readonly maxValue: number | null;
  readonly price: number;
};

export type SaveShippingRateInput = {
  readonly minValue: number;
  readonly maxValue?: number | null;
  readonly price: number;
};

export type ShippingMethod = {
  readonly id: string;
  readonly zoneId: string;
  readonly carrierId: string | null;
  readonly code: string;
  readonly rateType: ShippingRateType;
  readonly baseRate: number;
  readonly freeOverAmount: number | null;
  readonly minDeliveryDays: number | null;
  readonly maxDeliveryDays: number | null;
  readonly isActive: boolean;
  readonly order: number;
  readonly name: string;
  readonly description: string | null;
  readonly translations: Translations;
  readonly carrier: ShippingCarrier | null;
  readonly rates: readonly ShippingRate[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ShippingMethodQuery = PageQuery & {
  readonly zoneId?: string;
  readonly carrierId?: string;
  readonly rateType?: ShippingRateType;
  readonly isActive?: boolean;
};

export type SaveShippingMethodInput = {
  readonly zoneId: string;
  readonly carrierId?: string | null;
  readonly code: string;
  readonly rateType: ShippingRateType;
  readonly baseRate?: number | null;
  readonly freeOverAmount?: number | null;
  readonly minDeliveryDays?: number | null;
  readonly maxDeliveryDays?: number | null;
  readonly isActive?: boolean;
  readonly order?: number;
  readonly translations: Translations;
  readonly rates?: readonly SaveShippingRateInput[];
};

export interface ShippingRepository {
  listCarriers(query?: PageQuery): Promise<Page<ShippingCarrier>>;
  getCarrier(id: string): Promise<ShippingCarrier>;
  createCarrier(input: SaveShippingCarrierInput): Promise<ShippingCarrier>;
  updateCarrier(
    id: string,
    input: Partial<SaveShippingCarrierInput>,
  ): Promise<ShippingCarrier>;
  deleteCarrier(id: string): Promise<void>;
  listZones(query?: PageQuery): Promise<Page<ShippingZone>>;
  getZone(id: string): Promise<ShippingZone>;
  createZone(input: SaveShippingZoneInput): Promise<ShippingZone>;
  updateZone(
    id: string,
    input: Partial<SaveShippingZoneInput>,
  ): Promise<ShippingZone>;
  deleteZone(id: string): Promise<void>;
  listMethods(query?: ShippingMethodQuery): Promise<Page<ShippingMethod>>;
  getMethod(id: string): Promise<ShippingMethod>;
  createMethod(input: SaveShippingMethodInput): Promise<ShippingMethod>;
  updateMethod(
    id: string,
    input: Partial<SaveShippingMethodInput>,
  ): Promise<ShippingMethod>;
  deleteMethod(id: string): Promise<void>;
  listRates(methodId: string): Promise<readonly ShippingRate[]>;
  createRate(
    methodId: string,
    input: SaveShippingRateInput,
  ): Promise<ShippingRate>;
  updateRate(
    methodId: string,
    rateId: string,
    input: Partial<SaveShippingRateInput>,
  ): Promise<ShippingRate>;
  deleteRate(methodId: string, rateId: string): Promise<void>;
}

/* Shipments & order fulfillment (admin) */

export type ShipmentStatus =
  | "pending"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "returned"
  | "cancelled";

export type ShipmentItem = {
  readonly id: string;
  readonly orderItemId: string;
  readonly quantity: number;
  readonly productId: string | null;
  readonly productName: string | null;
  readonly sku: string | null;
  readonly variantAttributes: Readonly<Record<string, unknown>> | null;
};

export type Shipment = {
  readonly id: string;
  readonly orderId: string;
  readonly orderNumber: string | null;
  readonly shipmentNumber: string;
  readonly carrierId: string | null;
  readonly carrierName: string | null;
  readonly trackingNumber: string | null;
  readonly trackingUrl: string | null;
  readonly status: ShipmentStatus;
  readonly note: string | null;
  readonly items: readonly ShipmentItem[];
  readonly shippedAt: string | null;
  readonly deliveredAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ShipmentQuery = PageQuery & {
  readonly status?: ShipmentStatus;
  readonly orderId?: string;
  readonly carrierId?: string;
  readonly search?: string;
};

export type FulfillmentLine = {
  readonly orderItemId: string;
  readonly productId: string | null;
  readonly productName: string | null;
  readonly sku: string | null;
  readonly variantAttributes: Readonly<Record<string, unknown>> | null;
  readonly quantityOrdered: number;
  readonly quantityShipped: number;
  readonly quantityRemaining: number;
};

export type OrderFulfillment = {
  readonly orderId: string;
  readonly orderNumber: string;
  readonly status: string;
  readonly items: readonly FulfillmentLine[];
};

export type CreateShipmentLine = {
  readonly orderItemId: string;
  readonly quantity: number;
};

export type CreateShipmentInput = {
  readonly carrierId?: string | null;
  readonly trackingNumber?: string | null;
  readonly status?: Extract<
    ShipmentStatus,
    "pending" | "in_transit" | "out_for_delivery" | "delivered"
  >;
  readonly note?: string | null;
  readonly items: readonly CreateShipmentLine[];
};

export type UpdateShipmentInput = {
  readonly carrierId?: string | null;
  readonly trackingNumber?: string | null;
  readonly note?: string | null;
};

export interface ShipmentRepository {
  list(query?: ShipmentQuery): Promise<Page<Shipment>>;
  get(id: string): Promise<Shipment>;
  update(id: string, input: UpdateShipmentInput): Promise<Shipment>;
  updateStatus(id: string, status: ShipmentStatus): Promise<Shipment>;
  listForOrder(orderId: string): Promise<readonly Shipment[]>;
  fulfillment(orderId: string): Promise<OrderFulfillment>;
  createForOrder(orderId: string, input: CreateShipmentInput): Promise<Shipment>;
}

/* Analytics — admin dashboard aggregates */

export type AnalyticsGranularity = "day" | "week" | "month";

export type AnalyticsTrend = {
  readonly value: number;
  readonly previousValue: number;
  readonly changePercent: number | null;
  readonly direction: string;
  readonly isImprovement: boolean;
};

export type AnalyticsSummary = {
  readonly revenue: AnalyticsTrend;
  readonly orders: AnalyticsTrend;
  readonly newCustomers: AnalyticsTrend;
  readonly refundRate: AnalyticsTrend;
};

export type RevenuePoint = {
  readonly bucket: string;
  readonly label: string;
  readonly revenue: number;
  readonly orders: number;
};

export type OrderStatusSlice = {
  readonly status: string;
  readonly label: string;
  readonly count: number;
  readonly percentage: number;
};

export type DashboardRecentOrder = {
  readonly id: string;
  readonly orderNumber: string;
  readonly customerId: string;
  readonly status: string;
  readonly paymentStatus: string;
  readonly total: number;
};

export type DashboardTopProduct = {
  readonly productId: string;
  readonly name: string | null;
  readonly imageUrl: string | null;
  readonly unitsSold: number;
  readonly revenue: number;
};

export type DashboardLowStockItem = {
  readonly productId: string;
  readonly name: string | null;
  readonly sku: string | null;
  readonly quantityAvailable: number;
  readonly status: string;
};

export type DashboardSnapshot = {
  readonly range: {
    readonly startDate: string;
    readonly endDate: string;
    readonly days: number;
    readonly label: string;
    readonly granularity: string;
  };
  readonly currency: string;
  readonly summary: AnalyticsSummary;
  readonly revenueSeries: readonly RevenuePoint[];
  readonly orderStatus: {
    readonly total: number;
    readonly slices: readonly OrderStatusSlice[];
  };
  readonly recentOrders: readonly DashboardRecentOrder[];
  readonly topProducts: readonly DashboardTopProduct[];
  readonly lowStock: {
    readonly total: number;
    readonly items: readonly DashboardLowStockItem[];
  };
};

export type RevenueSeries = {
  readonly granularity: string;
  readonly points: readonly RevenuePoint[];
};

export type DashboardQuery = {
  readonly startDate: string;
  readonly endDate: string;
  readonly granularity?: AnalyticsGranularity;
  readonly recentOrders?: number;
  readonly topProducts?: number;
  readonly lowStock?: number;
};

export type RevenueSeriesQuery = {
  readonly startDate: string;
  readonly endDate: string;
  readonly granularity?: AnalyticsGranularity;
};

export interface AnalyticsRepository {
  dashboard(query: DashboardQuery): Promise<DashboardSnapshot>;
  revenueSeries(query: RevenueSeriesQuery): Promise<RevenueSeries>;
}

export type EcommerceCore = {
  readonly catalog: CatalogRepository;
  readonly inventory: InventoryRepository;
  readonly orders: OrderRepository;
  readonly reviews: ReviewRepository;
  readonly cms: CmsRepository;
  readonly customers: CustomerRepository;
  readonly customerGroups: CustomerGroupRepository;
  readonly promotions: PromotionRepository;
  readonly notifications: NotificationRepository;
  readonly vendors: VendorRepository;
  readonly shipping: ShippingRepository;
  readonly shipments: ShipmentRepository;
  readonly analytics: AnalyticsRepository;
};
