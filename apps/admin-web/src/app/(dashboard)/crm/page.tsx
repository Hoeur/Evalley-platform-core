import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/design-system/ui/button";
import {
  CrmMetricCards,
  getCrmDashboardWorkspace,
  LeadsTable,
} from "@/features/crm";

export default async function CrmDashboardPage() {
  await requireModuleAccess("crm", "crm.dashboard.view");
  const workspace = await getCrmDashboardWorkspace();
  return (
    <PageContainer>
      <PageHeader
        title="CRM"
        description="Customer relationships, leads, and sales pipeline from core-crm-api."
        actions={
          <Button asChild variant="outline">
            <Link href="/crm/leads">
              All leads
              <ArrowUpRight />
            </Link>
          </Button>
        }
      />
      <CrmMetricCards metrics={workspace.metrics} />
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-muted-foreground text-sm font-medium">
            Recent leads
          </h2>
          <span className="text-muted-foreground text-xs">
            {workspace.totalLeads} total · core-crm-api
          </span>
        </div>
        <LeadsTable leads={workspace.leads} />
      </section>
    </PageContainer>
  );
}
