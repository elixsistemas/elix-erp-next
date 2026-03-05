# ERP Functional Map

Este documento descreve o **mapa funcional do Elix ERP Next**.

Ele representa os domínios principais do sistema e as relações entre eles.

Este mapa serve como referência para:

* arquitetura de backend
* organização do frontend
* estrutura do menu
* modelagem de banco de dados

---

# Domínios Principais do ERP

O Elix ERP Next é organizado em domínios funcionais.

```
ERP
 ├ Core
 ├ Cadastros
 ├ Comercial
 ├ Estoque
 ├ Financeiro
 ├ Fiscal
 ├ Relatórios
 └ Administração
```

---

# Core

Responsável pela base do sistema.

```
auth
users
roles
permissions
companies
company_modules
branding
```

Funções:

* autenticação
* controle de permissões
* multiempresa
* controle de módulos

---

# Cadastros

Dados mestres utilizados por todo o sistema.

```
products
customers
suppliers
bank_accounts
payment_terms
```

Esses dados são utilizados por:

* comercial
* financeiro
* estoque
* fiscal

---

# Comercial

Responsável pelo ciclo comercial.

Fluxo principal:

```
Quote
  ↓
Order
  ↓
Sale
```

Módulos envolvidos:

```
quotes
orders
sales
```

---

# Fiscal

Responsável por cálculo e validação tributária.

```
fiscal
fiscal_engine
```

Funções:

* determinar CFOP
* determinar CST
* aplicar regras tributárias
* validar operação fiscal

---

# Estoque

Controle de movimentações e saldo de produtos.

```
inventory
inventory_movements
```

Funções:

* saldo atual
* movimentações
* inventário

---

# Financeiro

Controle financeiro da empresa.

```
accounts_receivable
receivables
bank_accounts
bank_balance_events
```

Funções:

* contas a receber
* controle bancário
* eventos financeiros

---

# Fluxo Principal do ERP

O fluxo central do sistema é:

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

# Observabilidade

Módulos de análise e relatórios observam os dados gerados pelos domínios principais.

```
dashboard
reports
```

Esses módulos não geram dados, apenas os analisam.

---

# Princípios Arquiteturais

O Elix ERP Next segue os seguintes princípios:

* arquitetura modular
* separação clara de domínios
* isolamento multiempresa
* regras de negócio no service layer
* acesso ao banco apenas via repository
