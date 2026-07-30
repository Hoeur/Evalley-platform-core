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

export type EcommerceCore = {
  readonly catalog: CatalogRepository;
  readonly inventory: InventoryRepository;
  readonly orders: OrderRepository;
  readonly reviews: ReviewRepository;
};
