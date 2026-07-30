import { describe, expect, it, vi } from "vitest";
import {
  createNestCrmCore,
  type CrmRequest,
  type CrmTransport,
} from "@platform/crm-core/api-client";

function envelope<T>(data: T) {
  return {
    success: true as const,
    data,
    meta: {
      requestId: "request-1",
      timestamp: "2026-07-30T00:00:00.000Z",
    },
  };
}

describe("Nest CRM adapter", () => {
  it("unwraps dashboard metrics and sends the version-relative route", async () => {
    const transport = vi.fn<CrmTransport>().mockResolvedValue(
      envelope({
        leadCount: 7,
        qualifiedLeadCount: 2,
        customerCount: 4,
        openOpportunityCount: 3,
        pipelineByCurrency: { USD: 12_500 },
      }),
    );
    const core = createNestCrmCore({
      transport: transport as unknown as CrmTransport,
    });

    await expect(core.dashboard.get()).resolves.toMatchObject({
      leadCount: 7,
      pipelineByCurrency: { USD: 12_500 },
    });
    expect(transport).toHaveBeenCalledWith({
      method: "GET",
      path: "/crm/dashboard",
    });
  });

  it("normalizes lead pages and forwards supported filters", async () => {
    const lead = {
      id: "01LEAD00000000000000000000",
      tenantId: "01TENANT000000000000000000",
      status: {
        id: "01STATUS000000000000000000",
        key: "QUALIFIED" as const,
        name: "Qualified",
      },
      firstName: "Dara",
      lastName: "Chan",
      companyName: "Angkor Foods",
      email: "dara@example.com",
      phone: null,
      estimatedValue: 8200,
      currency: "USD",
      priority: "HIGH" as const,
      description: null,
      assignedUserId: null,
      nextFollowUpAt: null,
      convertedAt: null,
      convertedCustomerId: null,
      createdAt: "2026-07-29T00:00:00.000Z",
      updatedAt: "2026-07-30T00:00:00.000Z",
    };
    const transport = vi.fn<CrmTransport>().mockResolvedValue(
      envelope({
        items: [lead],
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      }),
    );
    const core = createNestCrmCore({
      transport: transport as unknown as CrmTransport,
    });

    const result = await core.leads.list({
      page: 1,
      limit: 20,
      search: "Dara",
      status: "QUALIFIED",
      sortBy: "updatedAt",
      sortDirection: "desc",
    });

    expect(result.items).toEqual([lead]);
    expect(transport).toHaveBeenCalledWith({
      method: "GET",
      path: "/crm/leads",
      query: {
        page: 1,
        limit: 20,
        search: "Dara",
        status: "QUALIFIED",
        assignedUserId: undefined,
        sortBy: "updatedAt",
        sortDirection: "desc",
      },
    } satisfies CrmRequest);
  });

  it("sends lead assignment and conversion mutations to their API routes", async () => {
    const transport = vi
      .fn<CrmTransport>()
      .mockResolvedValueOnce(
        envelope({
          id: "01LEAD00000000000000000000",
          tenantId: "01TENANT000000000000000000",
          status: {
            id: "01STATUS000000000000000000",
            key: "NEW",
            name: "New",
          },
          firstName: "Dara",
          lastName: "Chan",
          companyName: null,
          email: null,
          phone: null,
          estimatedValue: null,
          currency: "USD",
          priority: "MEDIUM",
          description: null,
          assignedUserId: "01USER00000000000000000000",
          nextFollowUpAt: null,
          convertedAt: null,
          convertedCustomerId: null,
          createdAt: "2026-07-29T00:00:00.000Z",
          updatedAt: "2026-07-30T00:00:00.000Z",
        }),
      )
      .mockResolvedValueOnce(
        envelope({
          customerId: "01CUSTOMER0000000000000000",
          primaryContactId: "01CONTACT00000000000000000",
          opportunityId: null,
        }),
      );
    const core = createNestCrmCore({
      transport: transport as unknown as CrmTransport,
    });

    await core.leads.assign(
      "01LEAD00000000000000000000",
      "01USER00000000000000000000",
    );
    await core.leads.convert("01LEAD00000000000000000000", {
      createOpportunity: false,
    });

    expect(transport).toHaveBeenNthCalledWith(1, {
      method: "POST",
      path: "/crm/leads/01LEAD00000000000000000000/assign",
      body: { assignedUserId: "01USER00000000000000000000" },
    });
    expect(transport).toHaveBeenNthCalledWith(2, {
      method: "POST",
      path: "/crm/leads/01LEAD00000000000000000000/convert",
      body: { createOpportunity: false },
    });
  });
});
