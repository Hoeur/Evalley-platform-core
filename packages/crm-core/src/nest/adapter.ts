import type {
  CrmCore,
  CrmPageQuery,
  CustomerQuery,
  LeadQuery,
  UpdateCrmLeadInput,
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
import {
  mapContact,
  mapCrmDashboard,
  mapCustomer,
  mapCustomerPage,
  mapLead,
  mapLeadConversion,
  mapLeadPage,
  mapTimelineEntry,
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

function customerQuery(query?: CustomerQuery) {
  return {
    ...pageQuery(query),
    search: query?.search,
    status: query?.status,
  };
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
    customers: {
      async list(query) {
        const envelope = await transport<NestCrmEnvelope<NestCustomerPageDto>>({
          method: "GET",
          path: "/crm/customers",
          query: customerQuery(query),
        });
        return mapCustomerPage(unwrapCrmData(envelope));
      },
      async get(id) {
        const envelope = await transport<NestCrmEnvelope<NestCustomerDto>>({
          method: "GET",
          path: `/crm/customers/${id}`,
        });
        return mapCustomer(unwrapCrmData(envelope));
      },
      async create(input) {
        const envelope = await transport<NestCrmEnvelope<NestCustomerDto>>({
          method: "POST",
          path: "/crm/customers",
          body: input,
        });
        return mapCustomer(unwrapCrmData(envelope));
      },
      async update(id, input) {
        const envelope = await transport<NestCrmEnvelope<NestCustomerDto>>({
          method: "PATCH",
          path: `/crm/customers/${id}`,
          body: input,
        });
        return mapCustomer(unwrapCrmData(envelope));
      },
      async archive(id) {
        await transport<NestCrmEnvelope<{ id: string }>>({
          method: "DELETE",
          path: `/crm/customers/${id}`,
        });
        return true;
      },
      async timeline(id) {
        const envelope = await transport<
          NestCrmEnvelope<readonly NestTimelineEntryDto[]>
        >({
          method: "GET",
          path: `/crm/customers/${id}/timeline`,
        });
        return unwrapCrmData(envelope).map(mapTimelineEntry);
      },
    },
    contacts: {
      async list(customerId) {
        const envelope = await transport<
          NestCrmEnvelope<readonly NestContactDto[]>
        >({
          method: "GET",
          path: "/crm/contacts",
          query: customerId ? { customerId } : undefined,
        });
        return unwrapCrmData(envelope).map(mapContact);
      },
      async get(id) {
        const envelope = await transport<NestCrmEnvelope<NestContactDto>>({
          method: "GET",
          path: `/crm/contacts/${id}`,
        });
        return mapContact(unwrapCrmData(envelope));
      },
      async create(input) {
        const envelope = await transport<NestCrmEnvelope<NestContactDto>>({
          method: "POST",
          path: "/crm/contacts",
          body: input,
        });
        return mapContact(unwrapCrmData(envelope));
      },
      async update(id, input) {
        const envelope = await transport<NestCrmEnvelope<NestContactDto>>({
          method: "PATCH",
          path: `/crm/contacts/${id}`,
          body: input,
        });
        return mapContact(unwrapCrmData(envelope));
      },
      async delete(id) {
        await transport<NestCrmEnvelope<{ id: string }>>({
          method: "DELETE",
          path: `/crm/contacts/${id}`,
        });
        return true;
      },
    },
  };
}
