
```markdown
# Route Protection Layers

Routes are protected by two guards.

## Layer 1 — RequireModule

Ensures the module is enabled for the company.

Example:

RequireModule("comercial.orders")

## Layer 2 — RequireAccess

Ensures the user has the required permission.

Example:

RequireAccess("orders.read")

## Why both?

Module:
controls feature availability.

Permission:
controls user authorization.

This allows:

- feature plans
- multi-tenant SaaS control
- role-based access control