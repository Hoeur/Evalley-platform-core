# @platform/crm-core

A reusable CRM add-on for the Evalley platform. Runs standalone or integrates with the
e-commerce, rental and booking modules through contracts and events — never through direct
imports of their internals. Enable it per client, export it into a new client project, and
customize it per client without editing this package.

> Original implementation. Inspired by common CRM concepts; contains no third-party CRM's
> code, schema, UI or assets.

## Phase 1 status (Architecture)

This package currently ships **contracts and registration only** — the shapes and wiring
every later phase builds on. There is deliberately no UI, no HTTP handler bodies, no SQL,
and no runtime validation yet.

| Area | State |
|------|-------|
| Plugin manifest, navigation, routes, permissions | ✅ defined |
| Domain entity contracts (tenant-aware) | ✅ types |
| Application commands / queries / service interfaces | ✅ interfaces |
| Infrastructure ports (repositories, events, integrations, storage) | ✅ interfaces |
| Zod validators, DB, controllers, UI, migrations, seed | ⏳ deferred (see folder READMEs) |

## Internal architecture

```text
src/
├── domain/          # Pure entity contracts + enums (no framework, no IO)
├── application/     # Use cases: commands, queries, services, dto (+ validators later)
├── infrastructure/  # Ports: repositories, events, integrations, storage (impls later)
├── api/             # Route descriptors (+ controllers, schemas later)
├── ui/              # Admin UI (later)
├── permissions/     # RBAC catalog
├── navigation.ts    # Host navigation contributions
├── manifest.ts      # Declarative plugin manifest
├── plugin.ts        # Lifecycle + register() wiring
└── index.ts         # PUBLIC API — the only supported import surface
```

Dependencies point inward: `ui → application → domain`, `infrastructure → domain`, and
everything reaches the outside world only through `@platform/shared` contracts and
`@platform/plugin-sdk`.

## Multi-tenancy

Every domain record extends `CrmRecord` (carries `tenantId`), and every repository/service
method takes a resolved `TenantContext`. The platform runs a single tenant today, but the
tenant is threaded everywhere so multi-tenant can be switched on without reshaping data.
`tenantId` is always resolved from the authenticated context — never from a request body.

## Public API

```ts
import {
  crmPlugin, crmManifest, crmPermissions, crmRoutes, crmNavigation,
  type Lead, type Customer, type Opportunity,
  type LeadService, type LeadRepository,
} from "@platform/crm-core";
```

## Standalone vs. integrated

- **Standalone:** required deps are `platform-core` + `auth-core` only. Leads → customers →
  opportunities → proposals → invoices → payments all work with no other module.
- **Integrated:** when `ecommerce-core` / `rental-core` / `booking-core` are enabled, CRM
  subscribes to their events and links external orders/customers into the timeline via the
  external-reference contract — without duplicating their logic.

## Tests

`tests/` covers manifest integrity, permission uniqueness, and standalone-vs-dependency
registration. Run with `pnpm --filter @platform/crm-core test` after `pnpm install`.
