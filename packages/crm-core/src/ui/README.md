# ui

CRM admin UI: pages, components, forms, hooks and tables (spec §16). Built on the host
`ui-core` design system (shadcn/ui primitives, tokens) — CRM must NOT re-implement buttons,
dialogs, tables or layout that already exist there.

**Deferred to Phase 3+.** Per the Phase 1 rule ("do not build UI pages yet"), no UI is
implemented here. When it lands it follows the app's clean-frontend split: pages stay
thin, hooks own data/behavior (TanStack Query), services call the CRM API, and components
render. Planned public components: `LeadTable`, `LeadForm`, `LeadDetails`,
`LeadConversionDialog`, `CustomerProfile`, `PipelineBoard`, `ActivityTimeline`,
`ProposalBuilder`, `TicketConversation`, `CrmGlobalSearch`, `CrmDashboardWidget`.
