# CRM Core — Domain Model

**Status:** Phase 1. These are contracts (TypeScript interfaces in
`packages/crm-core/src/domain`). No persistence exists yet; the ERD is the target shape a
later phase migrates.

## Conventions

- **Identifiers:** ULID strings, branded as `Id` (`@platform/shared`).
- **Tenant:** every persisted record extends `CrmRecord` → carries `tenantId` +
  `createdAt` / `updatedAt` / `deletedAt` (soft delete).
- **Money:** amounts are numbers paired with an ISO-4217 `currency`; never a bare number
  where a currency is implied.
- **Polymorphic attachments:** activities, tasks, notes, tags, attachments, comments and
  custom-field values reference a target by `(entityType, entityId)` where `entityType` is
  a `CrmEntityType`.

## Entity relationships

```mermaid
erDiagram
    COMPANY ||--o{ CUSTOMER : "groups"
    CUSTOMER ||--o{ CONTACT : "has"
    CUSTOMER ||--o{ OPPORTUNITY : "has"
    CUSTOMER ||--o{ PROPOSAL : "receives"
    CUSTOMER ||--o{ INVOICE : "billed"
    CUSTOMER ||--o{ CONTRACT : "signs"
    CUSTOMER ||--o{ TICKET : "raises"

    LEAD ||--o| CUSTOMER : "converts to"
    LEAD }o--|| LEAD_SOURCE : "from"
    LEAD }o--|| LEAD_STATUS : "has"

    PIPELINE ||--o{ PIPELINE_STAGE : "contains"
    PIPELINE ||--o{ OPPORTUNITY : "organizes"
    PIPELINE_STAGE ||--o{ OPPORTUNITY : "at stage"

    OPPORTUNITY ||--o{ PROPOSAL : "sourced from"
    PROPOSAL ||--o{ PROPOSAL_ITEM : "has lines"
    PROPOSAL ||--o| INVOICE : "becomes"
    ESTIMATE ||--o{ ESTIMATE_ITEM : "has lines"
    INVOICE ||--o{ INVOICE_ITEM : "has lines"
    INVOICE ||--o{ PAYMENT : "paid by"

    TICKET ||--o{ TICKET_MESSAGE : "thread"
    TICKET_DEPARTMENT ||--o{ TICKET : "routes"

    TAG ||--o{ ENTITY_TAG : "applied via"
    CUSTOM_FIELD_DEFINITION ||--o{ CUSTOM_FIELD_VALUE : "instantiated as"
    EXTERNAL_REFERENCE }o--|| CUSTOMER : "links external → crm"

    LEAD {
        Id id
        TenantId tenantId
        string firstName
        string lastName
        string email
        Id statusId
        Id assignedUserId
        Id convertedCustomerId
    }
    CUSTOMER {
        Id id
        TenantId tenantId
        string displayName
        string customerType
        string status
        Id accountManagerId
    }
    OPPORTUNITY {
        Id id
        Id pipelineId
        Id stageId
        number amount
        number probability
        string status
    }
    PROPOSAL {
        Id id
        string proposalNumber
        string status
        number grandTotal
    }
    INVOICE {
        Id id
        string invoiceNumber
        number grandTotal
        number balanceDue
        string status
    }
    PAYMENT {
        Id id
        Id invoiceId
        number amount
        string status
    }
```

Supporting tables not drawn above: `NOTE`, `COMMENT`, `ATTACHMENT`, `ACTIVITY`, `TASK`,
`EMAIL_LOG`, `COMMUNICATION_LOG`, `CRM_SETTINGS`, `AUDIT_LOG` — all polymorphic on
`(entityType, entityId)` and tenant-scoped.

## Aggregates and invariants

- **Lead** — an unqualified prospect. Converts (once) into a customer; `convertedAt` /
  `convertedCustomerId` are set atomically. Duplicate detection by email/phone before
  create.
- **Opportunity** — a revenue deal in a pipeline. Stage changes and won/lost transitions
  are authorized, server-validated use cases; `probability` defaults from the stage.
- **Proposal / Estimate / Invoice** — totals (`subtotal`, `discountTotal`, `taxTotal`,
  `grandTotal`, `balanceDue`) are computed server-side from line items, never trusted from
  the client. Line items reference external catalogs via
  `referenceType ∈ {ecommerce_product, rental_item, booking_service, custom_item}`.
- **Invoice** — may originate from a proposal or an external order
  (`orderReferenceType`/`orderReferenceId`); CRM stores the reference and owns none of the
  order's logic.
- **Payment** — recorded against an invoice; `metadata` must never hold sensitive payment
  data (masked before persistence).
- **Ticket** — support thread with messages, department routing and escalation.

## Lead conversion (transactional)

A single transaction; either all steps commit or none do.

```mermaid
sequenceDiagram
    participant API as Controller
    participant Svc as LeadService.convert
    participant UoW as UnitOfWork.transaction
    participant Repo as Repositories
    participant Bus as EventBus

    API->>Svc: convert(ctx, { leadId, createOpportunity })
    Svc->>UoW: begin (tenant-scoped)
    UoW->>Repo: create Customer
    UoW->>Repo: create primary Contact
    opt createOpportunity
        UoW->>Repo: create Opportunity
    end
    UoW->>Repo: copy notes, activities, tags, attachments
    UoW->>Repo: mark Lead converted (convertedAt, convertedCustomerId)
    UoW-->>Svc: commit
    Svc->>Bus: publish crm.lead.converted (idempotent)
    Svc-->>API: { customerId, primaryContactId, opportunityId? }
```

## Proposal → payment flow

```mermaid
graph LR
    O[Opportunity] --> P[Proposal draft]
    P -->|send| PS[Proposal sent]
    PS -->|accept| PA[Proposal accepted]
    PA -->|convertToInvoice| I[Invoice]
    I -->|recordPayment| PAY[Payment]
    PAY -->|balanceDue = 0| PAID[Invoice paid]
    PAID -.emits.-> EV[crm.invoice.paid]
```

External orders join the same invoice flow without CRM re-implementing them:

```mermaid
graph LR
    EO[ecommerce.order.completed] --> C{CRM customer exists?}
    C -- no --> NC[create Customer from CustomerReference]
    C -- yes --> EX[use existing]
    NC --> T[append timeline entry via ExternalReference]
    EX --> T
    T --> INV[optional Invoice reference]
```
