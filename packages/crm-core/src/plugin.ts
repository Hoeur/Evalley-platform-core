import { definePlugin, type PluginContext } from "@platform/plugin-sdk";
import { crmManifest } from "./manifest.js";

/**
 * The CRM plugin. `register()` runs only when the module is enabled and its required
 * dependencies are satisfied. Here it wires optional-module integrations defensively —
 * subscribing to e-commerce/rental/booking events only when those modules are present, so
 * CRM works identically whether they are installed or not (spec §1, §5, §7).
 *
 * Handler bodies arrive in later phases; Phase 1 establishes the wiring contract.
 */
export const crmPlugin = definePlugin({
  manifest: crmManifest,

  lifecycle: {
    async onEnable(ctx: PluginContext) {
      ctx.logger.info("CRM enabled", { optionalModules: describeOptional(ctx) });
    },
    async onApplicationStart(ctx: PluginContext) {
      ctx.logger.debug("CRM starting");
    },
  },

  register(ctx: PluginContext) {
    // Optional integrations: only wire what is installed.
    if (ctx.hasModule("ecommerce-core")) {
      // ctx.bindEventHandler(makeEcommerceOrderCompletedHandler(...)) — Phase 7
    }
    if (ctx.hasModule("rental-core")) {
      // ctx.bindEventHandler(makeRentalContractSignedHandler(...)) — Phase 7
    }
    if (ctx.hasModule("booking-core")) {
      // ctx.bindEventHandler(makeBookingCompletedHandler(...)) — Phase 7
    }
    // Route and job runners are bound to manifest ids here in later phases.
  },
});

function describeOptional(ctx: PluginContext): string[] {
  return ["ecommerce-core", "rental-core", "booking-core", "notification-core", "audit-core"].filter(
    (module) => ctx.hasModule(module),
  );
}
