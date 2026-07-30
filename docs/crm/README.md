# CRM Core documentation

Documentation for the `@platform/crm-core` add-on. Phase 1 (Architecture) is complete;
remaining docs land with their phases.

| Doc | What it covers | State |
|-----|----------------|-------|
| [architecture.md](architecture.md) | Context, goals, workspace layout, layering, plugin model, multi-tenancy, integration, decisions | ✅ |
| [domain-model.md](domain-model.md) | Entity contracts, ERD, lead-conversion and proposal→payment flows | ✅ |
| [plugin-system.md](plugin-system.md) | Manifest, dependency validation, lifecycle, adding a module | ✅ |
| installation.md | Install/enable per client | ⏳ Phase 2 |
| configuration.md | Env + client config | ⏳ Phase 2 |
| permissions.md | RBAC catalog + record scopes | ⏳ Phase 2 |
| events.md | Published/consumed events | ⏳ Phase 7 |
| api.md | Endpoint reference + OpenAPI | ⏳ Phase 3+ |
| customization.md | Client extension points | ⏳ Phase 9 |
| migrations.md | Schema + `plugin_migrations` | ⏳ Phase 2 |
| testing.md | Test strategy + isolation tests | ⏳ Phase 10 |
| client-export.md | Client project generator | ⏳ Phase 9 |

## Quick orientation

- Code: `packages/crm-core/` — public API at `src/index.ts`.
- Plugin SDK: `packages/plugin-sdk/` — manifest, registry, dependency validation.
- Shared contracts: `packages/shared/` — ids, tenant, events, references.
