# crm-core migrations

CRM owns its schema migrations (spec §13). They run in order, transactionally where
supported, are checksum-verified, and are tracked in a `plugin_migrations` table
(`pluginId`, `migrationName`, `checksum`, `executedAt`, `executionTimeMs`, `status`).

**Deferred to Phase 2.** The platform is frontend-only with dummy data right now, so there
is no database to migrate. Planned initial set:

```text
001_create_crm_leads
002_create_crm_customers
003_create_crm_contacts
004_create_crm_pipelines
005_create_crm_opportunities
006_create_crm_activities
007_create_crm_proposals
008_create_crm_invoices
009_create_crm_contracts
010_create_crm_tickets
```

Each migration name is also registered in the manifest's `migrations` array so the host
can plan and verify them at install/enable time.
