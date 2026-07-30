export type CrmPageQuery = {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: "createdAt" | "updatedAt" | "firstName" | "lastName";
  readonly sortDirection?: "asc" | "desc";
};

export type CrmLeadStatus =
  "NEW" | "CONTACTED" | "QUALIFIED" | "UNQUALIFIED" | "CONVERTED";

export type CrmLeadPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type LeadQuery = CrmPageQuery & {
  readonly search?: string;
  readonly status?: Exclude<CrmLeadStatus, "CONVERTED">;
  readonly assignedUserId?: string;
};

export type CrmPage<T> = {
  readonly items: readonly T[];
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
};

export type CrmDashboard = {
  readonly leadCount: number;
  readonly qualifiedLeadCount: number;
  readonly customerCount: number;
  readonly openOpportunityCount: number;
  readonly pipelineByCurrency: Readonly<Record<string, number>>;
};

export type CrmLeadRecord = {
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

export type CreateCrmLeadInput = {
  readonly firstName: string;
  readonly lastName: string;
  readonly companyName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly website?: string;
  readonly assignedUserId?: string;
  readonly estimatedValue?: number;
  readonly currency?: string;
  readonly priority?: CrmLeadPriority;
  readonly description?: string;
  readonly nextFollowUpAt?: string;
};

export type UpdateCrmLeadInput = Partial<
  Omit<CreateCrmLeadInput, "currency" | "website">
> & {
  readonly companyName?: string | null;
  readonly email?: string | null;
  readonly phone?: string | null;
  readonly assignedUserId?: string | null;
  readonly estimatedValue?: number | null;
  readonly description?: string | null;
  readonly nextFollowUpAt?: string | null;
  readonly status?: Exclude<CrmLeadStatus, "CONVERTED">;
};

export type ConvertCrmLeadInput = {
  readonly createOpportunity?: boolean;
  readonly opportunityTitle?: string;
  readonly opportunityAmount?: number;
  readonly pipelineId?: string;
  readonly stageId?: string;
};

export type CrmLeadConversion = {
  readonly customerId: string;
  readonly primaryContactId: string;
  readonly opportunityId: string | null;
};

export type CrmCustomerType = "INDIVIDUAL" | "COMPANY";
export type CrmCustomerStatus =
  "ACTIVE" | "INACTIVE" | "PROSPECT" | "ARCHIVED";

export type CrmCustomerContactSummary = {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly isPrimary: boolean;
};

export type CrmCustomerRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly customerType: CrmCustomerType;
  readonly companyName: string | null;
  readonly displayName: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly website: string | null;
  readonly status: CrmCustomerStatus;
  readonly accountManagerId: string | null;
  readonly currency: string;
  readonly source: string | null;
  readonly contacts: readonly CrmCustomerContactSummary[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CustomerQuery = CrmPageQuery & {
  readonly search?: string;
  readonly status?: CrmCustomerStatus;
};

export type CreateCrmCustomerInput = {
  readonly customerType: CrmCustomerType;
  readonly displayName: string;
  readonly companyName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly website?: string;
  readonly accountManagerId?: string;
  readonly currency?: string;
  readonly source?: string;
};

export type UpdateCrmCustomerInput = {
  readonly customerType?: CrmCustomerType;
  readonly displayName?: string;
  readonly companyName?: string | null;
  readonly email?: string | null;
  readonly phone?: string | null;
  readonly website?: string | null;
  readonly accountManagerId?: string | null;
  readonly status?: CrmCustomerStatus;
  readonly currency?: string;
  readonly source?: string | null;
};

export type CrmContactRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly customerId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly jobTitle: string | null;
  readonly isPrimary: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateCrmContactInput = {
  readonly customerId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email?: string;
  readonly phone?: string;
  readonly jobTitle?: string;
  readonly isPrimary?: boolean;
};

export type UpdateCrmContactInput = {
  readonly firstName?: string;
  readonly lastName?: string;
  readonly email?: string | null;
  readonly phone?: string | null;
  readonly jobTitle?: string | null;
  readonly isPrimary?: boolean;
};

export type CrmTimelineEntry = {
  readonly id: string;
  readonly type: string;
  readonly subject: string;
  readonly body: string | null;
  readonly occurredAt: string;
  readonly createdBy: string;
};

export interface CrmCore {
  readonly dashboard: {
    get(): Promise<CrmDashboard>;
  };
  readonly leads: {
    list(query?: LeadQuery): Promise<CrmPage<CrmLeadRecord>>;
    get(id: string): Promise<CrmLeadRecord>;
    create(input: CreateCrmLeadInput): Promise<CrmLeadRecord>;
    update(id: string, input: UpdateCrmLeadInput): Promise<CrmLeadRecord>;
    assign(id: string, assignedUserId: string | null): Promise<CrmLeadRecord>;
    archive(id: string): Promise<boolean>;
    convert(id: string, input: ConvertCrmLeadInput): Promise<CrmLeadConversion>;
  };
  readonly customers: {
    list(query?: CustomerQuery): Promise<CrmPage<CrmCustomerRecord>>;
    get(id: string): Promise<CrmCustomerRecord>;
    create(input: CreateCrmCustomerInput): Promise<CrmCustomerRecord>;
    update(
      id: string,
      input: UpdateCrmCustomerInput,
    ): Promise<CrmCustomerRecord>;
    archive(id: string): Promise<boolean>;
    timeline(id: string): Promise<readonly CrmTimelineEntry[]>;
  };
  readonly contacts: {
    list(customerId?: string): Promise<readonly CrmContactRecord[]>;
    get(id: string): Promise<CrmContactRecord>;
    create(input: CreateCrmContactInput): Promise<CrmContactRecord>;
    update(id: string, input: UpdateCrmContactInput): Promise<CrmContactRecord>;
    delete(id: string): Promise<boolean>;
  };
}
