# ADR 0004 — Module Access Layer

Status: Accepted

## Context

The ERP needs to support SaaS feature gating and tenant feature control.

## Decision

Introduce module-level access control using:

RequireModule

Modules are enabled per company.

Permissions continue to control user-level access.

## Consequences

Pros:

- SaaS plans become possible
- company-level feature toggling
- cleaner domain boundaries

Cons:

- routes require two guards