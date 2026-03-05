# Elix ERP Next — Product Capability Map

Este documento mapeia **Capacidades do Produto** (o que o ERP “faz”) e conecta:

- **UX/Menu** (apps/web/src/app/menu.config.ts)
- **RBAC** (permissões `perm`)
- **Feature Gating por empresa** (`company_modules.module_key` → `requireModule()`)

> Regra de ouro:
> - `module_key` controla **se a capacidade existe** para a empresa (plano / habilitação).
> - `perm` controla **quem pode usar** (perfil / RBAC).
> - Menu só **reflete** isso (oculta), mas o backend **enforça** (middleware).

---

## 1) Convenções

### module_key
Formato adotado (ADR-0001): `domain.feature` (lowercase).

Ex.: `commercial.sales`, `inventory.movements`, `finance.receivables`.

### perm
Formato atual do menu: `resource.action` (lowercase).

Ex.: `products.read`, `sales.read`, `roles.read`.

---

## 2) Mapa de capacidades (UX ↔ Módulo ↔ Permissões)

> **Como ler**:
> - **Capacidade**: nome de produto.
> - **Menu/Path**: onde aparece no front.
> - **module_key**: chave do `company_modules` (habilita por empresa).
> - **Permissões mínimas**: permissões que hoje o menu exige. (O backend deve espelhar nas rotas.)

### Dashboard

| Capacidade | Menu/Path | module_key | Permissões mínimas |
|---|---|---|---|
| Visão geral do negócio | `/dashboard` | `core.dashboard` | *(opcional; pode ser pública autenticada)* |

### Comercial

| Capacidade | Menu/Path | module_key | Permissões mínimas |
|---|---|---|---|
| Orçamentos | `/comercial/orcamentos` | `commercial.quotes` | `quotes.read` |
| Pedidos | `/comercial/pedidos` | `commercial.orders` | `orders.read` |
| Vendas | `/comercial/vendas` | `commercial.sales` | `sales.read` |
| Expedição | `/comercial/expedicao` | `commercial.shipments` | `shipments.read` |
| Devoluções | `/comercial/devolucoes` | `commercial.returns` | `returns.read` |

### Financeiro

| Capacidade | Menu/Path | module_key | Permissões mínimas |
|---|---|---|---|
| Contas a receber | `/finance/receivables` | `finance.receivables` | `receivables.read` |
| Contas a pagar | `/finance/payables` | `finance.payables` | `payables.read` |
| Fluxo de caixa | `/finance/cashflow` | `finance.cashflow` | `cashflow.read` |
| Conciliação | `/finance/reconciliation` | `finance.reconciliation` | `reconciliation.read` |
| Pagamentos | `/finance/payments` | `finance.payments` | `payments.read` |

### Fiscal

| Capacidade | Menu/Path | module_key | Permissões mínimas |
|---|---|---|---|
| Documentos fiscais | `/fiscal/documents` | `fiscal.documents` | `fiscal_docs.read` |
| NF-e | `/fiscal/nfe` | `fiscal.nfe` | `nfe.read` |
| NFS-e | `/fiscal/nfse` | `fiscal.nfse` | `nfse.read` |
| Regras/Tributos | `/fiscal/tax-rules` | `fiscal.rules` | `tax_rules.read` |
| Perfis fiscais | `/fiscal/tax-profiles` | `fiscal.tax_profiles` | `tax_profiles.read` |

### Estoque

| Capacidade | Menu/Path | module_key | Permissões mínimas |
|---|---|---|---|
| Saldo atual | `/inventory` | `inventory.stock` | `inventory.read` |
| Movimentações | `/inventory/movements` | `inventory.movements` | `inventory_movements.read` |
| Inventário | `/inventory/counts` | `inventory.counts` | `inventory_counts.read` |
| Locais/Depósitos | `/inventory/locations` | `inventory.locations` | `inventory_locations.read` |

### Cadastros

| Capacidade | Menu/Path | module_key | Permissões mínimas |
|---|---|---|---|
| Empresas | `/cadastros/empresa` | `cadastros.companies` | `companies.read` |
| Fornecedores | `/cadastros/fornecedores` | `cadastros.suppliers` | `suppliers.read` |
| Clientes | `/cadastros/clientes` | `cadastros.customers` | `customers.read` |
| Produtos | `/cadastros/produtos` | `cadastros.products` | `products.read` |
| Base Fiscal (cadastro) | `/cadastros/fiscal` | `cadastros.fiscal_registry` | `fiscal_cfop.read` |
| Serviços | `/cadastros/servicos` | `cadastros.services` | `services.read` |
| Contas Bancárias | `/cadastros/contas-bancarias` | `cadastros.bank_accounts` | `bank_accounts.read` |
| Meios de pagamento | `/cadastros/meios-pagamento` | `cadastros.payment_methods` | `payment_methods.read` |
| Condições | `/cadastros/condicoes` | `cadastros.payment_terms` | `payment_terms.read` |

### Relatórios

| Capacidade | Menu/Path | module_key | Permissões mínimas |
|---|---|---|---|
| Relatórios de Vendas | `/reports/sales` | `reports.sales` | `reports_sales.read` |
| Relatórios Financeiro | `/reports/finance` | `reports.finance` | `reports_finance.read` |
| Relatórios Estoque | `/reports/inventory` | `reports.inventory` | `reports_inventory.read` |
| Relatórios Fiscal | `/reports/fiscal` | `reports.fiscal` | `reports_fiscal.read` |

### Administração

| Capacidade | Menu/Path | module_key | Permissões mínimas |
|---|---|---|---|
| Usuários | `/admin/users` | `admin.users` | `users.read` |
| Perfis & Permissões | `/admin/roles` | `admin.roles` | `roles.read` |
| Configurações (Empresa/Módulos) | `/admin/settings` | `admin.settings` | `company_modules.read` |
| Auditoria | `/admin/audit` | `admin.audit` | `audit.read` |

---

## 3) Matriz de enforcement (onde cada regra vive)

| Camada | Responsabilidade | Fonte |
|---|---|---|
| **Menu (Front)** | Ocultar o que o usuário não deve ver | `menu.config.ts` + perms/modules carregados |
| **API (Back)** | Bloquear acesso de verdade | `requireModule()` + `requirePermission()` nas rotas |
| **DB** | Fonte de verdade de habilitação | `company_modules` (enabled por empresa) |
| **Auth** | Fonte de verdade do usuário | `req.auth` (userId, companyId, roles, perms) |

---

## 4) Checklist para adicionar uma capacidade nova

1. Definir **Domínio** (Comercial/Fiscal/Estoque/Financeiro/Cadastros/etc.).
2. Criar/confirmar `module_key` (ADR-0001) e adicionar no seed/gestão de módulos.
3. Criar permissões `resource.action` (RBAC) e incluir em roles.
4. Backend: proteger rotas com `requireModule(module_key)` e `requirePermission(perm)`.
5. Frontend: adicionar item no `MENU_CONFIG` com `module` + `perm`.
6. Documentar mudanças: ADR curto se mexer em padrões/nomes/fluxos.

---

## 5) Notas de produto (planos SaaS)

O `module_key` também é a base do catálogo de planos:

- **Starter**: cadastros + comercial básico
- **Pro**: + estoque + financeiro + fiscal
- **Enterprise**: + auditoria + relatórios avançados + integrações

> Recomendação: manter uma tabela/seed de **module catalog** (module_key, label, domain, default_enabled, description)
> para alimentar UI de “módulos da empresa” e também o painel do super admin.

---

## Referências

- `apps/web/src/app/menu.config.ts`
- `apps/api/src/config/requireModule.ts`
- `apps/api/src/config/prehandlers.ts`
- `docs/adr/0001-module-keys.md`
- `docs/00-overview/domain-boundaries.md`
