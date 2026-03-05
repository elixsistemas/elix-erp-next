# Elix ERP Next — Architecture Diagram (Produto)

Este documento é o **diagrama oficial** de arquitetura do Elix ERP Next.
Ele conecta: **domínios do ERP → módulos do backend → UX/menu → contratos entre serviços**.

Objetivo:
- servir como referência contínua (fonte de verdade)
- evitar duplicidade de módulos/rotas/conceitos
- manter o sistema coerente ao longo do ciclo de vida

---

## 1) Visão macro do sistema (SaaS multiempresa)

```mermaid
flowchart TB
  U[Usuário] -->|UI| WEB[apps/web (React + Vite)]
  WEB -->|HTTP + JWT| API[apps/api (Fastify)]
  API -->|SQL| DB[(SQL Server)]
  API -->|Logs/Auditoria| AUD[(Audit/Logs - futuro)]

  subgraph SaaS[Escopo SaaS]
    API
    DB
  end

  note1{{Multi-tenant: companyId em req.auth e nas queries}} --- API
  note2{{Feature gating: company_modules + requireModule()}} --- API
  note3{{RBAC: roles/perms + requirePermission()}} --- API

  2) Domínios do ERP (mapa mental + UX)

  flowchart LR
  CORE[Core / Plataforma] --> REG[Cadastros]
  REG --> COM[Comercial]
  COM --> FISC[Fiscal]
  COM --> INV[Estoque]
  COM --> FIN[Financeiro]
  COM --> REP[Relatórios]
  COM --> DASH[Dashboard]

  CORE:::core
  REG:::dom
  COM:::dom
  FISC:::dom
  INV:::dom
  FIN:::dom
  REP:::obs
  DASH:::obs

  classDef core fill:#222,color:#fff,stroke:#555,stroke-width:1px;
  classDef dom fill:#0b3d91,color:#fff,stroke:#0b3d91,stroke-width:1px;
  classDef obs fill:#3a3a3a,color:#fff,stroke:#666,stroke-width:1px;

Leitura correta do desenho:

    Cadastros alimenta todo mundo.

    Comercial é o gatilho do “mundo real”.

    A Venda é o evento central que dispara: Fiscal + Estoque + Financeiro.

    Dashboard/Relatórios observam (não devem ser o lugar onde regras de negócio nascem).

3) Back-end: módulos atuais (estado real do repo)

    Fonte: apps/api/src/modules/*

mindmap
  root((apps/api modules))
    core
      auth
      users
      roles
      companies
      company_modules
      branding
      dashboard
    cadastros
      products
      customers
      suppliers
      bank_accounts
      payment_terms
    comercial
      quotes
      orders
      sales
    estoque
      inventory
      inventory_movements
    financeiro
      receivables
      accounts_receivable
      bank_balance_events
    fiscal
      fiscal
        engine

Nota importante:

receivables e accounts_receivable coexistem hoje → ver ADR 0003-receivables-naming.md.

4) Fluxo canônico do ERP (o “coração” do Elix)

sequenceDiagram
  autonumber
  participant UI as Web UI
  participant API as API (Fastify)
  participant COM as Comercial (sales)
  participant FIS as Fiscal (engine)
  participant INV as Estoque (movements)
  participant FIN as Financeiro (receivables)

  UI->>API: POST /sales (JWT)
  API->>COM: service.createSale(dados)
  COM->>FIS: fiscal.preflight(sale) [validar]
  FIS-->>COM: ok + regras aplicáveis
  COM->>INV: inventory.applyMovement(sale) [efeito colateral]
  COM->>FIN: receivables.createFromSale(sale) [efeito colateral]
  COM-->>API: sale criado
  API-->>UI: 201 + sale

 Regra de ouro: efeitos colaterais devem ser idempotentes (não duplicar movimentação/título se repetir a operação). 

 5) Contratos entre módulos (anti-acoplamento acidental)

Esses contratos são “interfaces mentais” (podem ser funções internas, não precisa microservices).

Comercial → Fiscal

fiscal.preflight(saleDraft): ValidationResult

fiscal.run(sale): FiscalResult

Comercial → Estoque

inventory.applyMovement(source: "sale", sourceId, items[]): MovementResult

Comercial → Financeiro

receivables.createFromSale(sale): Receivable[]

Diretriz:

Comercial não calcula imposto manualmente (Fiscal manda).

Comercial não mexe em estoque com SQL direto (Estoque manda).

Comercial não cria título na unha (Financeiro manda).

6) Segurança e escopo (o que nunca pode falhar)
Auth (JWT)

req.auth = { userId, companyId, roles, perms }

RBAC

requirePermission("x.y") em rotas sensíveis.

Feature gating

company_modules + requireModule("module_key") em rotas de módulo.

Regra de vida:

Menu filtra o que aparece.
Middleware filtra o que existe.

7) Dicionário de Module Keys (diretriz do produto)

O module_key é capacidade vendável / feature gate.
Não precisa ser 1:1 com pasta do módulo.

Exemplos iniciais (ver ADR 0001):

commercial.sales

inventory.movements

finance.receivables

fiscal.documents

8) Padrões de evolução (como manter o trem no trilho)
Quando criar um módulo novo

criar pasta em apps/api/src/modules/<nome>

incluir controller/service/repository/routes/schema

definir module_key (feature gate)

definir permissões (RBAC)

adicionar item no menu (com module + perm)

documentar decisão em docs/adr/

Quando mudar uma decisão importante

criar ADR curto: contexto → decisão → consequências

linkar no ARCHITECTURE.md

9) Backlog arquitetural (próximos degraus naturais)

Padronizar module_key no banco (lowercase, sem variação)

Endpoint /auth/me retornar modules + perms

Front construir menu com module + perm

Resolver naming receivables vs accounts_receivable

Definir estados canônicos de Venda (draft/approved/cancelled)

Idempotência (movimentações e títulos)

10) Links de referência interna

README.md

ARCHITECTURE.md

docs/00-overview/erp-map.md

docs/adr/*


---

## Onde isso entra na hierarquia
Você fica com um “núcleo” de consulta assim:

- `README.md` (como rodar)
- `ARCHITECTURE.md` (visão geral)
- `docs/00-overview/erp-map.md` (mapa funcional)
- `docs/00-overview/architecture-diagram.md` (diagramas oficiais)
- `docs/adr/*` (decisões)

---

## Commit sugerido
Quando você criar esses arquivos, manda um commit tipo:

```bash
git add docs/00-overview/architecture-diagram.md
git commit -m "docs: add Elix architecture diagrams and canonical flows"