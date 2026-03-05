# Elix ERP Next — Architecture Diagram

Este documento descreve a arquitetura de alto nível do **Elix ERP Next**.
Os diagramas usam **Mermaid**, que é renderizado automaticamente pelo GitHub.

---

# 1. Visão geral do sistema

```mermaid
flowchart TB

User[Usuário]
Web[Frontend React + Vite]
API[Backend Fastify API]
DB[(SQL Server)]

User --> Web
Web -->|HTTP + JWT| API
API --> DB

API -->|logs / auditoria| Logs[(Logs / Auditoria - futuro)]
```

---

# 2. Domínios do ERP

```mermaid
flowchart LR

Core[Core / Plataforma]
Cadastros[Cadastros]
Comercial[Comercial]
Fiscal[Fiscal]
Estoque[Estoque]
Financeiro[Financeiro]
Relatorios[Relatórios]
Dashboard[Dashboard]

Core --> Cadastros
Cadastros --> Comercial
Comercial --> Fiscal
Comercial --> Estoque
Comercial --> Financeiro
Comercial --> Relatorios
Comercial --> Dashboard
```

---

# 3. Módulos do Backend

```mermaid
mindmap
  root((Elix API Modules))
    Core
      auth
      users
      roles
      companies
      company_modules
      branding
      dashboard
    Cadastros
      products
      customers
      suppliers
      bank_accounts
      payment_terms
    Comercial
      quotes
      orders
      sales
    Estoque
      inventory
      inventory_movements
    Financeiro
      receivables
      accounts_receivable
      bank_balance_events
    Fiscal
      fiscal
        engine
```

---

# 4. Fluxo principal do ERP

```mermaid
sequenceDiagram
autonumber

participant UI as Web UI
participant API as API
participant COM as Comercial
participant FIS as Fiscal Engine
participant INV as Inventory
participant FIN as Finance

UI->>API: Criar Venda
API->>COM: createSale()

COM->>FIS: fiscal.preflight()
FIS-->>COM: regras fiscais

COM->>INV: gerar movimentação
COM->>FIN: gerar contas a receber

COM-->>API: venda criada
API-->>UI: resposta
```

---

# 5. Fluxo de impacto da venda

```mermaid
flowchart TD

Venda[Venda]
Fiscal[Motor Fiscal]
Estoque[Movimentação de Estoque]
Financeiro[Contas a Receber]

Venda --> Fiscal
Venda --> Estoque
Venda --> Financeiro
```

---

# 6. Segurança

O backend utiliza três camadas de controle:

### Autenticação
JWT com:

req.auth = { userId, companyId, roles, perms }

### RBAC
Middleware:

requirePermission("permission_code")

### Feature gating por empresa

Tabela:

company_modules

Middleware:

requireModule("module_key")

---

# 7. Princípios arquiteturais

O Elix ERP Next segue estes princípios:

- arquitetura modular
- multiempresa (multi-tenant)
- domínio separado por módulos
- controllers sem regra de negócio
- regras no service layer
- banco acessado apenas via repository

---

# Referências

Documentos relacionados:

ARCHITECTURE.md  
docs/00-overview/erp-map.md  
docs/00-overview/erd-core.md  
docs/adr/*
