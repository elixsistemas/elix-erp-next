# ARCHITECTURE.md

# Elix ERP Next – Arquitetura do Sistema

Este documento descreve a arquitetura do **Elix ERP Next**, um ERP SaaS multiempresa com arquitetura modular e motor fiscal determinístico.

O objetivo deste documento é servir como **fonte de verdade arquitetural** para desenvolvedores que trabalham no projeto.

---

# 1. Visão Geral

O Elix ERP Next é um sistema ERP SaaS projetado para:

* múltiplas empresas na mesma plataforma
* arquitetura modular
* controle de permissões granular
* motor fiscal automatizado
* frontend desacoplado da API

Arquitetura geral:

```
Client (React)
        │
        ▼
REST API (Fastify)
        │
        ▼
Application Services
        │
        ▼
Repositories
        │
        ▼
SQL Server
```

---

# 2. Estrutura do Repositório

O projeto utiliza arquitetura **monorepo**.

```
apps/
 ├ api
 │   └ Backend Fastify
 │
 └ web
     └ Frontend React
```

Backend e frontend evoluem juntos, mas são **aplicações independentes**.

---

# 3. Backend Architecture

Localização:

```
apps/api
```

Stack principal:

* Node.js
* Fastify
* TypeScript
* SQL Server
* JWT Authentication

---

# 4. Estrutura de Módulos

Cada domínio do sistema é implementado como um **módulo isolado**.

Estrutura padrão:

```
modules/
   module_name/
      controller.ts
      service.ts
      repository.ts
      routes.ts
      schema.ts
```

Responsabilidades:

Controller
Recebe requisições HTTP.

Service
Contém regras de negócio.

Repository
Responsável por acesso ao banco de dados.

Schema
Validação de dados (Zod).

---

# 5. Domínios do Sistema

Os módulos seguem os domínios principais de um ERP.

## Autenticação

```
auth
users
roles
permissions
```

Responsável por login, autenticação e controle de acesso.

---

## Cadastros

```
companies
customers
suppliers
products
bank_accounts
payment_terms
```

Base de dados mestres do sistema.

---

## Comercial

```
quotes
orders
sales
```

Responsável pelo ciclo comercial:

Orçamento → Pedido → Venda.

---

## Estoque

```
inventory
inventory_movements
```

Gerencia:

* saldo
* movimentações
* inventários

---

## Financeiro

```
accounts_receivable
receivables
bank_accounts
bank_balance_events
```

Responsável por:

* contas a receber
* fluxo bancário
* conciliações

---

## Fiscal

```
fiscal
```

Inclui o motor fiscal responsável por:

* classificação fiscal
* cálculo de impostos
* validações tributárias

Submódulo:

```
fiscal/engine
```

Contém o motor fiscal determinístico.

---

# 6. Multiempresa (Multi-Tenant)

O sistema suporta múltiplas empresas utilizando o mesmo backend.

Cada requisição autenticada contém:

```
req.auth = {
  userId
  companyId
  roles
  perms
}
```

Todas as consultas devem considerar:

```
company_id
```

para garantir isolamento de dados.

---

# 7. Controle de Módulos

Empresas podem habilitar ou desabilitar funcionalidades.

Tabela:

```
company_modules
```

Estrutura:

```
company_id
module_key
enabled
```

Middleware responsável:

```
requireModule(moduleKey)
```

Esse middleware bloqueia acesso a rotas quando o módulo está desabilitado.

---

# 8. Controle de Permissões (RBAC)

O sistema utiliza modelo **Role Based Access Control**.

Entidades principais:

```
users
roles
permissions
user_roles
role_permissions
```

Permissões são avaliadas via middleware:

```
requirePermission(permissionCode)
```

Exemplo:

```
products.read
products.create
products.update
products.delete
```

---

# 9. Menu do Sistema

O menu do frontend reflete os **domínios do ERP**.

Arquivo:

```
apps/web/src/app/menu.config.ts
```

Cada item pode possuir:

```
module
perm
```

O frontend esconde automaticamente menus não disponíveis para o usuário.

---

# 10. Fluxo de Autenticação

1. Usuário realiza login
2. API valida credenciais
3. JWT é gerado
4. Token é enviado ao frontend
5. Frontend envia token nas requisições
6. Middleware `requireAuth` valida o token

Durante a validação:

* roles são carregadas
* permissions são carregadas

Resultado:

```
req.auth
```

---

# 11. Fluxo Comercial

Fluxo principal de vendas:

```
Quote
   ↓
Order
   ↓
Sale
   ↓
Fiscal Engine
   ↓
Inventory Movement
   ↓
Accounts Receivable
```

Uma venda impacta simultaneamente:

* fiscal
* estoque
* financeiro

---

# 12. Motor Fiscal

Localização:

```
modules/fiscal/engine
```

Responsável por determinar:

* CFOP
* CST
* alíquotas
* regras tributárias

O motor é **determinístico**, baseado em regras configuráveis.

---

# 13. Frontend Architecture

Localização:

```
apps/web
```

Stack:

* React
* Vite
* TypeScript

Responsabilidades:

* interface do usuário
* navegação
* consumo da API

---

# 14. Camadas do Sistema

Arquitetura lógica:

```
UI Layer
   │
API Layer
   │
Service Layer
   │
Repository Layer
   │
Database
```

Essa separação garante:

* manutenção facilitada
* testes mais simples
* evolução segura do sistema.

---

# 15. Estratégia de Deploy

Arquitetura recomendada:

Frontend

```
Vercel
```

Backend

```
Render / Railway / VPS
```

Banco de dados

```
SQL Server
```

---

# 16. Diretrizes de Desenvolvimento

Regras importantes do projeto:

* todos os módulos seguem estrutura padrão
* acesso ao banco sempre via repository
* lógica de negócio nunca no controller
* validação via schemas
* permissões sempre verificadas nas rotas

---

# 17. Evolução Planejada

Fases futuras do sistema:

Motor fiscal avançado

Sugestão automática de classificação fiscal.

IA fiscal

Sugestões inteligentes de:

* NCM
* CFOP
* regras tributárias.

BI e relatórios avançados.

Integrações bancárias.

Integrações com marketplaces.

---

# 18. Filosofia do Projeto

O Elix ERP Next busca ser:

* modular
* escalável
* auditável
* preparado para SaaS

Toda decisão arquitetural deve preservar esses princípios.
