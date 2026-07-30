# ADR: configuration-driven white-label administration

## Status

Accepted for the initial platform foundation.

## Context

Evalley Dashboard must support multiple commerce customers without copying repositories. Early deployments are isolated per customer and selected by `CLIENT_KEY`; hostname-based multi-tenancy may follow. Customer differences include identity, theme, layout, modules, localization, permissions and backend integration.

## Decision

Use a modular monolith. It preserves simple local builds and deployments while enforcing feature boundaries that can be extracted only when operational evidence justifies it.

Use configuration instead of repository copies. A strongly typed registry resolves the active client once at the server boundary. Components consume capabilities and semantic values, never scattered client-name conditionals.

Use semantic theme tokens. Branding can change without editing component classes, charts/sidebar share the same token source, and light/dark modes preserve the client identity.

Use layout and module registries. Three layouts implement one contract and render identical route content. Module metadata is intersected with client enablement and permissions to create deterministic navigation.

Use repository adapters. Feature UI consumes domain models; backend DTOs, endpoints and legacy behavior remain isolated behind contracts and mappers. Server and public runtime configuration remain separate.

Use Server Components by default for initial data, session/client resolution and permission enforcement. Small client islands own interaction only.

Use URL state for tables so pagination, search, filters and sort are shareable, refresh-safe and server-queryable. Do not download an entire dataset to paginate in the browser.

Use TanStack Query only for interactive remote state, not every initial query. Use Zustand only for small UI preferences, never sessions, tokens, forms or backend records.

## Consequences

- Onboarding requires a configuration/registry entry instead of a new codebase.
- Server guards remain mandatory even when navigation/actions are hidden.
- Backend contracts can vary by adapter without leaking DTOs into UI.
- Layout/theme/module additions are explicit extension points.
- Hostname resolution can later replace environment selection after trusted host validation, with no feature-component changes.
