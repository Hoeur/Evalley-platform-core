import "server-only";
import type {
  ShippingCarrier,
  ShippingMethod,
  ShippingZone,
} from "@platform/ecommerce-core";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";

export type ShippingData = {
  carriers: readonly ShippingCarrier[];
  zones: readonly ShippingZone[];
  methods: readonly ShippingMethod[];
};

export async function getShippingData(): Promise<ShippingData> {
  const core = getEcommerceCore();
  const [carriers, zones, methods] = await Promise.all([
    core.shipping.listCarriers({ perPage: 100 }),
    core.shipping.listZones({ perPage: 100 }),
    core.shipping.listMethods({ perPage: 100 }),
  ]);
  return {
    carriers: carriers.items,
    zones: zones.items,
    methods: methods.items,
  };
}
