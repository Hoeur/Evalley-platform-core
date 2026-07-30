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
}
