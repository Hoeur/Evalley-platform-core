export type ProductDto = {
  product_id: string;
  product_name: string;
  product_sku: string;
  image_url?: string | null;
  category_name?: string | null;
  unit_price: number | string;
  stock_quantity: number;
  product_status: string;
  created_at: string;
  updated_at: string;
};
