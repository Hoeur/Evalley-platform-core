# application/validators

Zod schemas that validate command inputs at the application boundary (spec §5, §14).

**Deferred to Phase 2 (Foundation).** Phase 1 defines the input DTO *types* in
`../commands`. Runtime validation is intentionally not wired yet so the Phase 1 package
type-checks without third-party runtime dependencies. Each command in `../commands` will
get a matching `*.schema.ts` here whose inferred type must equal the command interface.
