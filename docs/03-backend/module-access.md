# Module Access System

The ERP uses a dual-layer access control model:

1. **Module access**
2. **Permission access**

## Module Access

Modules represent large functional areas of the system.

Examples:

- comercial.orders
- comercial.quotes
- inventory.stock
- admin.users

Modules are enabled per company.

Table:

company_modules

Fields:

company_id  
module_key  
enabled

## Frontend Enforcement

Routes are protected using:

RequireModule

Example:

```tsx
<Route element={<RequireModule module="comercial.orders" />}>
  <Route path="/comercial/pedidos" element={<PedidosListPage />} />
</Route>