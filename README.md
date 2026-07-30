# Evalley Platform (monorepo)

A modular commerce platform. One shared codebase deploys to many client projects; each
client installs only the core add-on modules it needs (E-commerce, Rental, Booking, CRM…).

> **Status:** Phase 1 (Architecture) of the CRM Core add-on. Backend persistence is not
> wired yet — modules run on in-memory dummy data behind repository interfaces. See
> [`docs/crm/architecture.md`](docs/crm/architecture.md).

## Workspace layout

```text
evalley-platform/
├── apps/
│   └── admin-web/            # Next.js 16 admin dashboard (the existing Evalley app)
├── packages/
│   ├── plugin-sdk/           # Reusable plugin contracts: manifest, registry, lifecycle
│   ├── shared/               # Cross-module contracts, events, tenant + id primitives
│   ├── crm-core/             # @platform/crm-core add-on (this initiative)
│   ├── platform-core/        # Host runtime contracts (stub — later phase)
│   ├── auth-core/            # Identity, session, permission host (stub — later phase)
│   ├── ui-core/              # Shared design system (stub — maps to app design-system)
│   ├── ecommerce-core/       # Optional integration source (stub)
│   ├── rental-core/          # Optional integration source (stub)
│   ├── booking-core/         # Optional integration source (stub)
│   ├── notification-core/    # Optional notification host (stub)
│   └── audit-core/           # Optional audit host (stub)
├── docs/crm/                 # CRM architecture documentation
├── package.json              # Root workspace scripts (turbo)
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json        # Shared compiler options + workspace path aliases
└── tsconfig.check.json       # Flat no-emit typecheck of every package (CI/local)
```

## Requirements

- Node `>= 20`
- pnpm `9.x` (`corepack enable && corepack prepare pnpm@9.12.0 --activate`)

## Getting started

```bash
pnpm install                 # install every workspace
pnpm typecheck:packages      # typecheck all core packages (no app build needed)
pnpm --filter @platform/admin-web dev
```

## Package boundaries (one-way dependencies)

```text
apps  →  *-core add-ons  →  plugin-sdk + shared
                    crm-core  →  (optional) ecommerce/rental/booking/notification-core
```

`shared` and `plugin-sdk` depend on nothing else in the workspace. Add-on cores never
import another add-on's internals — cross-module communication goes through the
contracts and events in `@platform/shared`. See the CRM docs for the full rationale.

## Manual files not tracked here

Dotfiles could not be written by the scaffolder in this environment. Add these by hand:

- **`.npmrc`** (root):
  ```ini
  link-workspace-packages=true
  prefer-workspace-packages=true
  save-workspace-protocol=rolling
  ```
- **`.gitignore`** (root): ignore `node_modules`, `.next`, `dist`, `*.tsbuildinfo`,
  `coverage`, `.turbo`.

## Migration note

`apps/admin-web` is a copy of the previous standalone `evalley-dashboard`. The original
folder was left in place as a backup — delete it once you have verified the monorepo. Its
package name is still `evalley-dashboard`; rename to `@platform/admin-web` when convenient.
Consolidate git history with a single `git init` at this monorepo root.
