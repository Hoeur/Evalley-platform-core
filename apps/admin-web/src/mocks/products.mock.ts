import type { Product } from "@/features/products/types/product.types";
const names = [
  "Wireless headphones",
  "Smart watch",
  "Portable SSD",
  "Mechanical keyboard",
  "4K monitor",
  "USB-C dock",
  "Ergonomic mouse",
  "Laptop stand",
  "Webcam pro",
  "Bluetooth speaker",
  "Tablet sleeve",
  "Fast charger",
];
export const productsMock: Product[] = Array.from(
  { length: 36 },
  (_, index) => {
    const stock = (index * 7) % 65;
    return {
      id: `prd-${String(index + 1).padStart(3, "0")}`,
      name: `${names[index % names.length]} ${Math.floor(index / names.length) + 1}`,
      sku: `MF-${String(1000 + index)}`,
      categoryName:
        index % 3 === 0
          ? "Audio"
          : index % 3 === 1
            ? "Computers"
            : "Accessories",
      price: 29.9 + index * 7.25,
      stock,
      inventoryStatus:
        stock === 0 ? "out-of-stock" : stock < 10 ? "low-stock" : "in-stock",
      status: index % 5 === 0 ? "draft" : "active",
      createdAt: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
      updatedAt: new Date(
        Date.UTC(2026, 6, Math.min(index + 1, 22)),
      ).toISOString(),
    };
  },
);
