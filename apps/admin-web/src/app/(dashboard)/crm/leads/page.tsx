import { requireModuleAccess } from "@/core/auth/authorize.server";
import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { getLeadsWorkspace, LeadsTable } from "@/features/crm";

export default async function CrmLeadsPage() {
  await requireModuleAccess("crmLeads", "crm.leads.view");
  const workspace = await getLeadsWorkspace();
  return (
    <PageContainer>
      <PageHeader
        title="Leads"
        description={`${workspace.total} leads from core-crm-api.`}
      />
      <LeadsTable leads={workspace.leads} />
    </PageContainer>
  );
}
