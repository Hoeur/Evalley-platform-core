import type {
  EventSubscriptionDescriptor,
  JobDescriptor,
  MigrationDescriptor,
  PluginManifest,
  WidgetDescriptor,
} from "@platform/plugin-sdk";
import { crmPermissions } from "./permissions/index.js";
import { crmRoutes } from "./api/routes/index.js";
import { crmNavigation } from "./navigation.js";

/** Background jobs the CRM contributes (spec §19). Runners bound in register(). */
const crmJobs: readonly JobDescriptor[] = [
  { id: "crm.followup-reminders", schedule: "0 * * * *", description: "Notify assignees of due follow-ups" },
  { id: "crm.overdue-activities", schedule: "*/30 * * * *", description: "Flag overdue activities" },
  { id: "crm.overdue-invoices", schedule: "0 6 * * *", description: "Mark and notify overdue invoices" },
  { id: "crm.contract-expiry", schedule: "0 7 * * *", description: "Remind on contracts nearing expiry" },
  { id: "crm.metric-aggregation", schedule: "0 2 * * *", description: "Aggregate CRM dashboard metrics" },
];

/** Dashboard widgets (spec §17). Rendered by the app; declared here for discovery. */
const crmWidgets: readonly WidgetDescriptor[] = [
  { key: "crm.total-leads", title: "Total leads", permission: "crm.dashboard.view" },
  { key: "crm.conversion-rate", title: "Lead conversion rate", permission: "crm.dashboard.view" },
  { key: "crm.pipeline-value", title: "Pipeline value", permission: "crm.dashboard.view" },
  { key: "crm.weighted-forecast", title: "Weighted forecast", permission: "crm.dashboard.view" },
  { key: "crm.upcoming-activities", title: "Upcoming activities", permission: "crm.dashboard.view" },
  { key: "crm.outstanding-invoices", title: "Outstanding invoices", permission: "crm.dashboard.view" },
  { key: "crm.open-tickets", title: "Open tickets", permission: "crm.dashboard.view" },
];

/** Events CRM subscribes to when the source module is installed (spec §7). */
const crmEventSubscriptions: readonly EventSubscriptionDescriptor[] = [
  { event: "ecommerce.order.completed", handlerId: "crm.onEcommerceOrderCompleted" },
  { event: "ecommerce.customer.created", handlerId: "crm.onEcommerceCustomerCreated" },
  { event: "rental.contract.signed", handlerId: "crm.onRentalContractSigned" },
  { event: "booking.completed", handlerId: "crm.onBookingCompleted" },
];

/** Migrations owned by CRM (spec §13). Files land in Phase 2; declared for registration. */
const crmMigrations: readonly MigrationDescriptor[] = [];

/**
 * The CRM plugin manifest — the single declarative description the host uses to validate,
 * order and activate the module. Required deps must be enabled; optional deps light up
 * integrations when present but are never required (CRM runs standalone).
 */
export const crmManifest: PluginManifest = {
  id: "crm",
  name: "CRM",
  version: "1.0.0",
  description: "Customer relationship management: leads, customers, pipeline, proposals, invoices, contracts and support.",
  dependencies: ["platform-core", "auth-core"],
  optionalDependencies: [
    "ecommerce-core",
    "rental-core",
    "booking-core",
    "notification-core",
    "audit-core",
  ],
  permissions: crmPermissions,
  routes: crmRoutes,
  navigation: crmNavigation,
  events: crmEventSubscriptions,
  migrations: crmMigrations,
  jobs: crmJobs,
  widgets: crmWidgets,
  featureFlags: [
    { key: "crm.proposals", description: "Enable proposals", defaultEnabled: true },
    { key: "crm.contracts", description: "Enable contracts", defaultEnabled: true },
    { key: "crm.tickets", description: "Enable support tickets", defaultEnabled: true },
    { key: "crm.estimates", description: "Enable estimates", defaultEnabled: false },
  ],
};
