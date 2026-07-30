import type { PermissionDescriptor } from "@platform/plugin-sdk";

/**
 * CRM permission catalog (spec §9). Registered through the manifest so the host RBAC
 * layer knows every permission the module enforces. All checks run server-side; hidden UI
 * is never the enforcement point.
 */

/** Record-level access scopes supported by data-bearing permissions. */
export const RECORD_SCOPES = ["all", "team", "assigned", "own"] as const;
export type RecordScope = (typeof RECORD_SCOPES)[number];

export const crmPermissions = [
  { key: "crm.dashboard.view", description: "View the CRM dashboard" },
  { key: "crm.search", description: "Search CRM records" },

  { key: "crm.leads.view", description: "View leads", scopes: RECORD_SCOPES },
  { key: "crm.leads.create", description: "Create leads" },
  { key: "crm.leads.update", description: "Update leads", scopes: RECORD_SCOPES },
  { key: "crm.leads.delete", description: "Delete leads", scopes: RECORD_SCOPES },
  { key: "crm.leads.assign", description: "Assign leads to staff" },
  { key: "crm.leads.convert", description: "Convert leads to customers" },
  { key: "crm.leads.export", description: "Export leads" },
  { key: "crm.leads.import", description: "Import leads" },

  { key: "crm.customers.view", description: "View customers", scopes: RECORD_SCOPES },
  { key: "crm.customers.create", description: "Create customers" },
  { key: "crm.customers.update", description: "Update customers", scopes: RECORD_SCOPES },
  { key: "crm.customers.delete", description: "Delete customers", scopes: RECORD_SCOPES },
  { key: "crm.customers.export", description: "Export customers" },

  { key: "crm.contacts.view", description: "View contacts" },
  { key: "crm.contacts.create", description: "Create contacts" },
  { key: "crm.contacts.update", description: "Update contacts" },
  { key: "crm.contacts.delete", description: "Delete contacts" },

  { key: "crm.opportunities.view", description: "View opportunities", scopes: RECORD_SCOPES },
  { key: "crm.opportunities.create", description: "Create opportunities" },
  { key: "crm.opportunities.update", description: "Update opportunities", scopes: RECORD_SCOPES },
  { key: "crm.opportunities.delete", description: "Delete opportunities", scopes: RECORD_SCOPES },
  { key: "crm.opportunities.assign", description: "Assign opportunities" },

  { key: "crm.activities.view", description: "View activities" },
  { key: "crm.activities.create", description: "Create activities" },
  { key: "crm.activities.update", description: "Update activities" },
  { key: "crm.activities.delete", description: "Delete activities" },

  { key: "crm.tasks.view", description: "View tasks" },
  { key: "crm.tasks.create", description: "Create tasks" },
  { key: "crm.tasks.update", description: "Update tasks" },
  { key: "crm.tasks.delete", description: "Delete tasks" },

  { key: "crm.communications.view", description: "View communication logs" },
  { key: "crm.communications.create", description: "Create communication logs" },

  { key: "crm.notes.view", description: "View notes and tags" },
  { key: "crm.notes.create", description: "Create notes and tags" },
  { key: "crm.notes.update", description: "Update notes and tag assignments" },
  { key: "crm.notes.delete", description: "Delete notes" },

  { key: "crm.attachments.view", description: "View attachment metadata" },
  { key: "crm.attachments.create", description: "Register attachment metadata" },
  { key: "crm.attachments.delete", description: "Delete attachment metadata" },

  { key: "crm.custom_fields.view", description: "View custom fields" },
  { key: "crm.custom_fields.manage", description: "Manage custom fields" },

  { key: "crm.proposals.view", description: "View proposals" },
  { key: "crm.proposals.create", description: "Create proposals" },
  { key: "crm.proposals.update", description: "Update proposals" },
  { key: "crm.proposals.delete", description: "Delete proposals" },
  { key: "crm.proposals.send", description: "Send proposals" },
  { key: "crm.proposals.accept", description: "Accept proposals" },

  { key: "crm.estimates.view", description: "View estimates" },
  { key: "crm.estimates.create", description: "Create estimates" },
  { key: "crm.estimates.update", description: "Update estimates" },
  { key: "crm.estimates.delete", description: "Delete estimates" },
  { key: "crm.estimates.send", description: "Send estimates" },
  { key: "crm.estimates.accept", description: "Accept estimates" },

  { key: "crm.invoices.view", description: "View invoices" },
  { key: "crm.invoices.create", description: "Create invoices" },
  { key: "crm.invoices.update", description: "Update invoices" },
  { key: "crm.invoices.delete", description: "Delete invoices" },
  { key: "crm.invoices.send", description: "Send invoices" },
  { key: "crm.invoices.record_payment", description: "Record invoice payments" },

  { key: "crm.contracts.view", description: "View contracts" },
  { key: "crm.contracts.create", description: "Create contracts" },
  { key: "crm.contracts.update", description: "Update contracts" },
  { key: "crm.contracts.delete", description: "Delete contracts" },

  { key: "crm.tickets.view", description: "View tickets" },
  { key: "crm.tickets.create", description: "Create tickets" },
  { key: "crm.tickets.update", description: "Update tickets" },
  { key: "crm.tickets.assign", description: "Assign tickets" },
  { key: "crm.tickets.close", description: "Close tickets" },

  { key: "crm.notifications.view", description: "View notifications" },
  { key: "crm.notifications.create", description: "Create notifications" },
  { key: "crm.notifications.retry", description: "Retry failed notifications" },

  { key: "crm.reports.view", description: "View CRM reports" },
  { key: "crm.settings.view", description: "View CRM settings" },
  { key: "crm.settings.manage", description: "Manage CRM settings" },
  { key: "crm.imports.create", description: "Create CRM imports" },
  { key: "crm.imports.view", description: "View CRM imports" },
  { key: "crm.exports.create", description: "Create CRM exports" },
  { key: "crm.exports.view", description: "View CRM exports" },
  { key: "crm.integrations.view", description: "View integration mappings" },
  { key: "crm.integrations.manage", description: "Manage integration mappings" },
] as const satisfies readonly PermissionDescriptor[];

/** Union of every CRM permission key. */
export type CrmPermission = (typeof crmPermissions)[number]["key"];

/** All CRM permission keys as a flat array. */
export const crmPermissionKeys: readonly CrmPermission[] = crmPermissions.map(
  (permission) => permission.key,
);
