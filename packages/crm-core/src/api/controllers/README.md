# api/controllers

Thin controllers that map an HTTP request to a `TenantContext` + command/query, call an
application service, and wrap the result in the standard API envelope (`@platform/shared`
`apiSuccess` / `apiPaginated` / `apiFailure`).

**Deferred to Phase 3+.** Route *descriptors* (path + permission) exist now in
`../routes`; controllers bind to those descriptor ids via the plugin's `register()`.
Controllers contain no business logic — that lives in `../../application/services`.
