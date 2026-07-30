import type {
  CrmContactRecord,
  CrmCustomerRecord,
  CrmDashboard,
  CrmLeadConversion,
  CrmLeadRecord,
  CrmPage,
  CrmTimelineEntry,
} from "../contracts";
import type {
  NestContactDto,
  NestCrmDashboardDto,
  NestCustomerDto,
  NestCustomerPageDto,
  NestLeadConversionDto,
  NestLeadDto,
  NestLeadPageDto,
  NestTimelineEntryDto,
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

export function mapCustomer(dto: NestCustomerDto): CrmCustomerRecord {
  return { ...dto, contacts: dto.contacts.map((contact) => ({ ...contact })) };
}

export function mapCustomerPage(
  dto: NestCustomerPageDto,
): CrmPage<CrmCustomerRecord> {
  return { ...dto, items: dto.items.map(mapCustomer) };
}

export function mapContact(dto: NestContactDto): CrmContactRecord {
  return { ...dto };
}

export function mapTimelineEntry(dto: NestTimelineEntryDto): CrmTimelineEntry {
  return { ...dto };
}
