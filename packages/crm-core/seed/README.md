# crm-core seed

Deterministic dummy data used to run the CRM UI without a backend, and to seed demo
tenants. Because the current phase is **frontend-only with dummy data**, this is where the
in-memory repository (Phase 2) draws its records from.

**Deferred to Phase 2.** Seed data will be plain typed fixtures conforming to the domain
contracts in `../src/domain`, scoped to a demo tenant id, covering leads, customers,
pipelines, opportunities, proposals, invoices and tickets so every screen has content.
