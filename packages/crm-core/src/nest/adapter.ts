import type {
  CrmCore,
  CrmPageQuery,
  LeadQuery,
  UpdateCrmLeadInput,
} from "../contracts";
import type {
  NestCrmDashboardDto,
  NestLeadConversionDto,
  NestLeadDto,
  NestLeadPageDto,
} from "./dto";
import {
  mapCrmDashboard,
  mapLead,
  mapLeadConversion,
  mapLeadPage,
} from "./mappers";
import {
  type CrmTransport,
  type NestCrmEnvelope,
  unwrapCrmData,
} from "./transport";

type NestCrmAdapterOptions = {
  readonly transport: CrmTransport;
};

function pageQuery(query?: CrmPageQuery) {
  return {
    page: query?.page,
    limit: query?.limit,
    sortBy: query?.sortBy,
    sortDirection: query?.sortDirection,
  };
}

function leadQuery(query?: LeadQuery) {
  return {
    ...pageQuery(query),
    search: query?.search,
    status: query?.status,
    assignedUserId: query?.assignedUserId,
  };
}

function leadUpdateBody(input: UpdateCrmLeadInput) {
  return { ...input };
}

export function createNestCrmCore({
  transport,
}: NestCrmAdapterOptions): CrmCore {
  return {
    dashboard: {
      async get() {
        const envelope = await transport<NestCrmEnvelope<NestCrmDashboardDto>>({
          method: "GET",
          path: "/crm/dashboard",
        });
        return mapCrmDashboard(unwrapCrmData(envelope));
      },
    },
    leads: {
      async list(query) {
        const envelope = await transport<NestCrmEnvelope<NestLeadPageDto>>({
          method: "GET",
          path: "/crm/leads",
          query: leadQuery(query),
        });
        return mapLeadPage(unwrapCrmData(envelope));
      },
      async get(id) {
        const envelope = await transport<NestCrmEnvelope<NestLeadDto>>({
          method: "GET",
          path: `/crm/leads/${id}`,
        });
        return mapLead(unwrapCrmData(envelope));
      },
      async create(input) {
        const envelope = await transport<NestCrmEnvelope<NestLeadDto>>({
          method: "POST",
          path: "/crm/leads",
          body: input,
        });
        return mapLead(unwrapCrmData(envelope));
      },
      async update(id, input) {
        const envelope = await transport<NestCrmEnvelope<NestLeadDto>>({
          method: "PATCH",
          path: `/crm/leads/${id}`,
          body: leadUpdateBody(input),
        });
        return mapLead(unwrapCrmData(envelope));
      },
      async assign(id, assignedUserId) {
        const envelope = await transport<NestCrmEnvelope<NestLeadDto>>({
          method: "POST",
          path: `/crm/leads/${id}/assign`,
          body: { assignedUserId },
        });
        return mapLead(unwrapCrmData(envelope));
      },
      async archive(id) {
        const envelope = await transport<NestCrmEnvelope<boolean>>({
          method: "DELETE",
          path: `/crm/leads/${id}`,
        });
        return unwrapCrmData(envelope);
      },
      async convert(id, input) {
        const envelope = await transport<
          NestCrmEnvelope<NestLeadConversionDto>
        >({
          method: "POST",
          path: `/crm/leads/${id}/convert`,
          body: input,
        });
        return mapLeadConversion(unwrapCrmData(envelope));
      },
    },
  };
}
