import type { NavigationDescriptor } from "@platform/plugin-sdk";

/**
 * CRM navigation contributed to the host shell. Icons are Lucide names (strings) resolved
 * by the app UI, keeping this module serializable and framework-free. Only appears when
 * the module is enabled and the user holds the listed permission.
 */
export const crmNavigation = [
  { key: "crm", label: "CRM", href: "/crm", icon: "Contact", group: "CRM", order: 300, permission: "crm.dashboard.view" },
  { key: "crm.leads", label: "Leads", href: "/crm/leads", icon: "UserPlus", group: "CRM", order: 310, permission: "crm.leads.view" },
  { key: "crm.customers", label: "Customers", href: "/crm/customers", icon: "Users", group: "CRM", order: 320, permission: "crm.customers.view" },
  { key: "crm.pipeline", label: "Pipeline", href: "/crm/opportunities", icon: "KanbanSquare", group: "CRM", order: 330, permission: "crm.opportunities.view" },
  { key: "crm.activities", label: "Activities", href: "/crm/activities", icon: "CalendarClock", group: "CRM", order: 340, permission: "crm.activities.view" },
  { key: "crm.proposals", label: "Proposals", href: "/crm/proposals", icon: "FileText", group: "CRM", order: 350, permission: "crm.proposals.view" },
  { key: "crm.invoices", label: "Invoices", href: "/crm/invoices", icon: "ReceiptText", group: "CRM", order: 360, permission: "crm.invoices.view" },
  { key: "crm.contracts", label: "Contracts", href: "/crm/contracts", icon: "FileSignature", group: "CRM", order: 370, permission: "crm.contracts.view" },
  { key: "crm.tickets", label: "Tickets", href: "/crm/tickets", icon: "LifeBuoy", group: "CRM", order: 380, permission: "crm.tickets.view" },
  { key: "crm.reports", label: "Reports", href: "/crm/reports", icon: "ChartNoAxesCombined", group: "CRM", order: 390, permission: "crm.reports.view" },
  { key: "crm.settings", label: "CRM Settings", href: "/crm/settings", icon: "Settings2", group: "CRM", order: 400, permission: "crm.settings.manage" },
] as const satisfies readonly NavigationDescriptor[];
