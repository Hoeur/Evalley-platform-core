# @platform/ecommerce-core

This package is the frontend/core contract for `core-ecommerce-api`. It is the
only Evalley business core connected to that Laravel service.

## Ownership

The core owns commerce capabilities:

- catalog products, variations, categories, brands, and attributes
- store-wide inventory
- orders and refunds
- customer review moderation
- future promotions, returns, shipments, vendors, payouts, and commerce reports

It does not own CRM, rental, booking, platform configuration, notifications, or
audit. Those capabilities use their own cores and backend services.

## Adapter boundary

`createLaravelEcommerceCore` accepts an injected transport. Laravel paths,
snake_case DTOs, money strings, translations, and the
`data.item`/`data.items` response envelope are normalized inside this package.
Admin modules consume the normalized repositories from `contracts.ts`.

The admin application supplies the server-only HTTP transport in
`apps/admin-web/src/core/ecommerce/ecommerce-core.server.ts`.

## Current API coverage

| Module | Status |
| --- | --- |
| Products | API connected, including inventory adjustment |
| Variants | API list connected per parent product |
| Attributes | API list connected |
| Inventory | API list and metrics connected |
| Categories and brands | API lists connected |
| Reviews | API list, approve, and reject connected |
| Orders | API list and detail connected; repository supports status, paid, and refunds |
| Promotions | Backend required |
| Returns | Backend required |
| Shipments | Backend required |
| Admin customers | Backend required |
| Vendors, withdrawals, ledger | Backend required |
| Marketing, shipping settings, reports, analytics | Backend required |

Unavailable commerce modules are marked `backend-required` in
`capabilities.ts`. When the Evalley client uses the `standard` adapter, those
modules cannot be enabled and do not appear in navigation.

## Admin configuration

Use an admin API base URL, not the public or customer route prefix:

```dotenv
CLIENT_KEY=evalley
API_BASE_URL=http://127.0.0.1:8000/api/v1/admin
API_TIMEOUT_MS=15000
ECOMMERCE_API_TOKEN=<admin bearer token>
AUTH_MODE=mock
```

`ECOMMERCE_API_TOKEN` is a local integration bridge while the admin application
still uses its mock session. Production must store access and refresh tokens in
the signed server session; never expose them to browser JavaScript or exported
client projects.

For local development, initialize Passport in `core-ecommerce-api`, then run
the connector from `apps/admin-web`. It logs in with the API's local seeded
admin, verifies the catalog endpoint, and writes the token to the ignored
`.env.local` file without printing it:

```powershell
pnpm api:connect
```

## Validation

From the monorepo:

```powershell
packages\ecommerce-core\node_modules\.bin\tsc.CMD --noEmit -p packages\ecommerce-core\tsconfig.json
apps\admin-web\node_modules\.bin\tsc.CMD --noEmit -p apps\admin-web\tsconfig.json
apps\admin-web\node_modules\.bin\vitest.CMD run src/core/ecommerce/ecommerce-core.test.ts
```
