/**
 * @platform/crm-core — public API.
 *
 * This barrel is the ONLY entry point other packages may import. Everything a consumer
 * needs — the plugin, manifest, permissions, domain contracts, application service
 * interfaces, infrastructure ports and route/navigation descriptors — is re-exported here.
 * Reaching into deep paths (e.g. `@platform/crm-core/src/...`) is not supported.
 */

// Registration surface
export { crmPlugin } from "./plugin.js";
export { crmManifest } from "./manifest.js";
export { crmNavigation } from "./navigation.js";
export { crmRoutes } from "./api/index.js";
export {
  crmPermissions,
  crmPermissionKeys,
  RECORD_SCOPES,
  type CrmPermission,
  type RecordScope,
} from "./permissions/index.js";
export * from "./contracts.js";
export { createNestCrmCore } from "./nest/adapter.js";
export type {
  CrmRequest,
  CrmTransport,
  NestCrmEnvelope,
} from "./nest/transport.js";
export { CrmApiContractError } from "./nest/transport.js";

// Contracts
export * from "./domain/index.js";
export * from "./application/index.js";
export * from "./infrastructure/index.js";
