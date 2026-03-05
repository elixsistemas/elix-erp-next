# ADR 0001 — Module Keys

## Status

Accepted

---

# Contexto

O sistema Elix ERP Next permite habilitar ou desabilitar funcionalidades por empresa através da tabela:

```
company_modules
```

Cada funcionalidade do sistema é representada por um `module_key`.

---

# Decisão

Os módulos do sistema devem seguir uma nomenclatura clara e consistente.

Formato:

```
domain.feature
```

---

# Lista Inicial de Module Keys

Core

```
core.auth
core.users
core.roles
core.companies
core.branding
```

Cadastros

```
cadastros.products
cadastros.customers
cadastros.suppliers
cadastros.bank_accounts
cadastros.payment_terms
```

Comercial

```
commercial.quotes
commercial.orders
commercial.sales
commercial.shipments
commercial.returns
```

Estoque

```
inventory.stock
inventory.movements
inventory.counts
inventory.locations
```

Financeiro

```
finance.receivables
finance.payables
finance.cashflow
finance.reconciliation
```

Fiscal

```
fiscal.documents
fiscal.nfe
fiscal.nfse
fiscal.rules
```

Administração

```
admin.users
admin.roles
admin.settings
admin.audit
```

---

# Consequências

Vantagens:

* controle granular por empresa
* ativação de módulos por plano SaaS
* padronização do sistema

Todos os novos módulos devem possuir um `module_key`.
