# Evalley white-label admin dashboard

A production-oriented Next.js 16 foundation for deploying one shared commerce administration platform to multiple customers. `CLIENT_KEY` resolves branding, semantic themes, layouts, enabled modules, feature flags, localization, permissions, and the backend adapter without customer checks inside components.

## Architecture

The project is a modular monolith with one-way dependencies:

```text
app -> layouts -> features -> components -> design-system -> core
```

`clients` may depend on core/design-system types, modules expose feature metadata, and feature repositories may use core infrastructure. Core and generic UI never import feature implementations or API endpoints. See [the architecture decision record](docs/architecture/white-label-admin.md).

Key folders:

- `src/app`: App Router entry points, route boundaries, authentication and dashboard groups.
- `src/clients`: validated public/server client configurations and registry.
- `src/layouts`: sidebar, compact and topbar implementations sharing one contract.
- `src/modules`: module metadata and permission-aware navigation builder.
- `src/features`: domain models, repositories, mappers, schemas and feature UI.
- `src/components`: reusable application-level page, table, form and feedback UI.
- `src/design-system`: shadcn primitives and semantic theme definitions.
- `src/core`: auth, environment, HTTP, errors, logging and utilities.
- `src/providers` and `src/stores`: minimal browser providers and small UI preferences.

## Local setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The root redirects to `/dashboard`, and unauthenticated requests are redirected to the selected client's login page.

Environment variables:

```env
CLIENT_KEY=evalley
API_BASE_URL=http://127.0.0.1:8000/api/v1/admin
CRM_API_BASE_URL=http://127.0.0.1:3100/api/v1
API_TIMEOUT_MS=15000
ECOMMERCE_API_TOKEN=
CRM_API_TOKEN=
CRM_API_EMAIL=
CRM_API_PASSWORD=
CRM_API_TENANT_SLUG=evalley-demo
AUTH_SESSION_SECRET=replace-with-at-least-32-random-characters
AUTH_MODE=cookie
```

Environment values are Zod-validated in `src/core/config`. Server values have no `NEXT_PUBLIC_` prefix and are never passed through the public client provider.

CRM dashboard requests use `CRM_API_BASE_URL` and the server-only
`CRM_API_EMAIL`, `CRM_API_PASSWORD`, and `CRM_API_TENANT_SLUG` credentials when
all three are configured. The server caches the short-lived access token,
rotates its refresh token, and retries one unauthorized request after
reauthenticating. Without service credentials it uses `CRM_API_TOKEN`, then
falls back to the current client access token when the commerce and CRM
services share an identity provider. Keep credentials in the deployment secret
store; never expose them through public client configuration.

## Client resolution and branding

`src/clients/client-resolver.server.ts` reads `CLIENT_KEY`, fails early for unknown keys, and resolves a registry entry. Four examples are included: `default`, `evalley`, `grocery`, and `renthouse`.

To select another registered customer:

```env
CLIENT_KEY=grocery
```

`grocery` uses a full green sidebar with catalog, orders, customers, promotions, marketing, shipping, and reporting. `renthouse` uses a compact indigo sidebar with properties, bookings, tenants, leases, payments, maintenance, marketing, and reporting:

```env
CLIENT_KEY=renthouse
```

Brand assets live under `public/brands/<client-key>`. Light/dark values are semantic OKLCH-compatible tokens in the client configuration. Change `primary`, sidebar, chart, typography or radius tokens there; component classes remain unchanged. The root Server Component emits the selected values, while `next-themes` controls only light/dark preference.

Client configuration selects `sidebar`, `compact`, or `topbar`. When enabled, the layout switcher saves a validated, client-namespaced HTTP-only cookie through `/api/preferences/layout`. The same route content is reused for every layout without carrying a saved preference into another client.

Enabled modules are the intersection of the registry, `client.modules`, and user permissions. Navigation hiding is only UX: pages and mutations call server permission and client-module guards independently, so a disabled module cannot be opened by typing its URL.

## Add a customer

```bash
npm run client:new -- acme
```

This validates the key, creates `src/clients/acme.client.ts` and `public/brands/acme`, and refuses to overwrite. Import the new config in `client-registry.ts`, then set `CLIENT_KEY=acme`. Use `--force` only for an intentional replacement.

Customize the generated client by:

1. Replacing assets under `public/brands/acme`.
2. Setting company names and light/dark semantic tokens.
3. Selecting the default/allowed layouts and density.
4. Enabling modules and feature flags.
5. Choosing locales and a server API adapter.

## Export a customer source project

Create a standalone Next.js project containing only one customer's configuration, brand assets, enabled routes, feature folders, module registry, and permissions:

```bash
npm run client:export -- grocery
```

The project is written to `exports/grocery-dashboard`. It has no multi-client registry or `CLIENT_KEY`; the selected configuration is flattened into `src/clients/client.config.ts`. Existing exports are protected from accidental replacement. Use `--force` only when you intentionally want to regenerate that exact client export:

```bash
npm run client:export -- grocery --force
```

## Authentication and permissions

Authentication is selected by the resolved client:

- `evalley` uses the `ecommerce-api` adapter and exchanges the login form credentials with `POST /auth/login`.
- `default`, `grocery`, and `renthouse` use isolated mock adapters until their own backend cores are connected. In development their credentials are shown on the login page; set `AUTH_MOCK_EMAIL` and `AUTH_MOCK_PASSWORD` to override them.
- `AUTH_MODE=mock` can force the mock adapter for local UI work. Use `AUTH_MODE=cookie` to honor each client's registered adapter.

The signed session, API access token, and refresh token are stored only in HTTP-only, same-site cookies whose names include `CLIENT_KEY`. A login for one exported/deployed client is therefore not accepted by another client. Commerce requests use the current client's access-token cookie. `ECOMMERCE_API_TOKEN` remains an optional server-only bootstrap fallback for development and should not be used as an end-user login mechanism.

Each deployment must set a strong, private `AUTH_SESSION_SECRET` and its own `CLIENT_KEY`, API URL, and backend credentials. Exported projects retain the selected client's auth adapter and `.env.example`; they do not contain runtime secrets.

The contracts include `Session`, `SessionUser`, `Role`, `Permission`, `getSession`, `requireSession`, `hasPermission`, and `requirePermission`. Server pages and mutations enforce both session and permissions. Never move access tokens to localStorage or Zustand.

## Backend integration

Products use the adapter pattern:

```text
route -> repository contract -> adapter -> DTO mapper -> domain model -> UI
```

For `CLIENT_KEY=evalley`, the resolver selects `laravelProductRepository` and connects product list, name/SKU search, status/category/inventory filters, pagination, sorting, create, update, stock movements, and delete to `core-ecommerce-api`. Catalog-owned filters use `/catalog/products`; stock-owned filters use `/inventory` so totals and pagination remain scoped to the same filtered result set. Other example clients retain `mockProductRepository` until their backend cores are connected.

To connect another backend:

1. Confirm real endpoint and authentication behavior.
2. Implement a standard/legacy repository using `serverApiRequest`.
3. Keep endpoint paths in that adapter.
4. Map backend DTOs to `Product` and domain inputs back to request DTOs.
5. Select the adapter in the client server config.

Do not call internal Route Handlers from Server Components. Use repositories/services directly. Browser mutations may call browser-safe handlers or Server Actions.

## Create a feature module

1. Add a feature folder with domain types, repository contract/adapter, mapper, schema and focused components.
2. Add its route Server Component and permission guard.
3. Register module metadata in `src/modules/module-registry.ts`.
4. Add its key to the desired clients.
5. Test mapper, URL parsing, permissions and key UI states.

Generic components must not import the new feature.

## State policy

- Server Components: initial data, client/session resolution, permissions and page composition.
- URL parameters: pagination, limits, search, filters, sorting and shareable tabs.
- TanStack Query: interactive remote state, polling, optimistic updates and refetch on demand.
- React Hook Form + Zod: form state and validation on client and server.
- Zustand: only small client UI preferences such as command-menu state.

## Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
npm run format:check
```

For deployment, set server-only environment variables per customer and run `npm run build && npm start`. The architecture is ready to replace `CLIENT_KEY` resolution with a trusted hostname-to-client mapping later; public/server configuration separation remains unchanged.

## Intentional adapters and placeholders

- Evalley authentication is connected to the ecommerce API. Other example clients intentionally use their isolated mock adapters until their backend cores are available.
- The API currently authenticates the administrator but does not return an admin RBAC profile; the dashboard grants its configured owner permission set after successful login. Replace that mapping when the API exposes roles and permissions.
- Refresh tokens are stored securely, but automatic refresh/rotation still requires a backend refresh contract and route.
- Product/dashboard repositories use deterministic mock data; API endpoints are not guessed.
- Orders, customers, users and settings expose complete route/layout/permission foundations but await their backend contracts.
- Image upload is a URL field placeholder until a signed upload flow exists.
