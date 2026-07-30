# infrastructure/database

Concrete persistence: connection, query builders and the repository implementations of the
ports in `../repositories`.

**Deferred.** Per the Phase 1 decision, the platform is frontend-only with **dummy data**
for now. Phase 2 adds an in-memory repository implementation (seeded from `../../../seed`)
behind the existing port interfaces; a backend-backed implementation follows once an API
exists. No code here changes the `../repositories` contracts.
