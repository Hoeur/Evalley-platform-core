import type {
  CrmDashboard,
  CrmLeadConversion,
  CrmLeadRecord,
  CrmPage,
} from "../contracts";
import type {
  NestCrmDashboardDto,
  NestLeadConversionDto,
  NestLeadDto,
  NestLeadPageDto,
} from "./dto";

export function mapCrmDashboard(dto: NestCrmDashboardDto): CrmDashboard {
  return {
    leadCount: dto.leadCount,
    qualifiedLeadCount: dto.qualifiedLeadCount,
    customerCount: dto.customerCount,
    openOpportunityCount: dto.openOpportunityCount,
    pipelineByCurrency: dto.pipelineByCurrency,
  };
}

export function mapLead(dto: NestLeadDto): CrmLeadRecord {
  return {
    ...dto,
    status: { ...dto.status },
  };
}

export function mapLeadPage(dto: NestLeadPageDto): CrmPage<CrmLeadRecord> {
  return {
    ...dto,
    items: dto.items.map(mapLead),
  };
}

export function mapLeadConversion(
  dto: NestLeadConversionDto,
): CrmLeadConversion {
  return { ...dto };
}
