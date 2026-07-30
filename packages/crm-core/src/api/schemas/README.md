# api/schemas

Request/response Zod schemas for the API layer and the source of the OpenAPI document
(spec §14). Kept separate from `../../application/validators` because these describe the
HTTP contract (query params, path params, response envelopes), not domain commands.

**Deferred to Phase 3+** alongside controllers.
