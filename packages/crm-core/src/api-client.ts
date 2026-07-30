export * from "./contracts";
export { createNestCrmCore } from "./nest/adapter";
export type {
  CrmRequest,
  CrmTransport,
  NestCrmEnvelope,
} from "./nest/transport";
export { CrmApiContractError } from "./nest/transport";
