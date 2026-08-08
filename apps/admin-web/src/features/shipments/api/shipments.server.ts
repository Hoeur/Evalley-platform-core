import "server-only";
import type { Page, Shipment } from "@platform/ecommerce-core";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";

export async function getShipments(): Promise<Page<Shipment>> {
  return getEcommerceCore().shipments.list({ perPage: 100 });
}
