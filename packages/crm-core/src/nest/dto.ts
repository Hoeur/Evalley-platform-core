import type {
  CrmContactRecord,
  CrmCustomerRecord,
  CrmDashboard,
  CrmPage,
  CrmLeadConversion,
  CrmLeadPriority,
  CrmLeadStatus,
  CrmTimelineEntry,
} from "../contracts";

export type NestCrmDashboardDto = CrmDashboard;

export type NestLeadDto = {
  readonly id: string;
  readonly tenantId: string;
  readonly status: {
    readonly id: string;
    readonly key: CrmLeadStatus;
    readonly name: string;
  };
  readonly firstName: string;
  readonly lastName: string;
  readonly companyName: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly estimatedValue: number | null;
  readonly currency: string;
  readonly priority: CrmLeadPriority;
  readonly description: string | null;
  readonly assignedUserId: string | null;
  readonly nextFollowUpAt: string | null;
  readonly convertedAt: string | null;
  readonly convertedCustomerId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type NestLeadPageDto = CrmPage<NestLeadDto>;

export type NestLeadConversionDto = CrmLeadConversion;

export type NestCustomerDto = CrmCustomerRecord;
export type NestCustomerPageDto = CrmPage<NestCustomerDto>;
export type NestContactDto = CrmContactRecord;
export type NestTimelineEntryDto = CrmTimelineEntry;
