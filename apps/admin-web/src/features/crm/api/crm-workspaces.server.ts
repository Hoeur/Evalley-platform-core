import "server-only";
import type {
  CrmDashboard,
  CrmLeadRecord,
  LeadQuery,
} from "@platform/crm-core/api-client";
import { getCrmCore } from "@/core/crm/crm-core.server";

export type CrmMetric = {
  readonly label: string;
  readonly value: string;
  readonly hint: string;
};

export type LeadsWorkspace = {
  readonly leads: readonly CrmLeadRecord[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
};

function formatPipelineValue(
  pipelineByCurrency: CrmDashboard["pipelineByCurrency"],
) {
  const values = Object.entries(pipelineByCurrency);
  if (values.length === 0) return "$0";
  return values
    .map(([currency, value]) => {
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        }).format(value);
      } catch {
        return `${currency} ${value.toLocaleString("en-US")}`;
      }
    })
    .join(" · ");
}

function mapDashboardMetrics(dashboard: CrmDashboard): readonly CrmMetric[] {
  return [
    {
      label: "Total leads",
      value: String(dashboard.leadCount),
      hint: "active CRM leads",
    },
    {
      label: "Qualified leads",
      value: String(dashboard.qualifiedLeadCount),
      hint: "ready for conversion",
    },
    {
      label: "Customers",
      value: String(dashboard.customerCount),
      hint: "active customer records",
    },
    {
      label: "Open pipeline",
      value: formatPipelineValue(dashboard.pipelineByCurrency),
      hint: `${dashboard.openOpportunityCount} open opportunities`,
    },
  ];
}

export async function getCrmDashboardWorkspace() {
  const core = getCrmCore();
  const [dashboard, recentLeads] = await Promise.all([
    core.dashboard.get(),
    core.leads.list({ page: 1, limit: 6, sortBy: "updatedAt" }),
  ]);

  return {
    metrics: mapDashboardMetrics(dashboard),
    leads: recentLeads.items,
    totalLeads: recentLeads.total,
  };
}

export async function getLeadsWorkspace(
  query: LeadQuery = {},
): Promise<LeadsWorkspace> {
  const page = await getCrmCore().leads.list({
    page: query.page ?? 1,
    limit: query.limit ?? 100,
    sortBy: query.sortBy ?? "updatedAt",
    sortDirection: query.sortDirection ?? "desc",
    search: query.search,
    status: query.status,
    assignedUserId: query.assignedUserId,
  });
  return {
    leads: page.items,
    total: page.total,
    page: page.page,
    totalPages: page.totalPages,
  };
}
