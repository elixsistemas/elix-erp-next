# Chart of Accounts (Plano de Contas)

O módulo de Plano de Contas define a estrutura contábil base do ERP.

Ele é utilizado por:

- Financeiro
- DRE
- Lançamentos contábeis
- Fluxo de caixa
- Relatórios financeiros

## Tabela

dbo.chart_of_accounts

## Estrutura

| Campo | Tipo | Descrição |
|------|------|-----------|
| id | int | identificador |
| company_id | int | empresa |
| parent_id | int | conta pai |
| code | varchar | código contábil |
| name | nvarchar | nome da conta |
| nature | varchar | asset, liability, equity, revenue, expense |
| account_kind | varchar | synthetic / analytic |
| allow_posting | bit | permite lançamento |
| is_result_account | bit | conta de resultado |
| dre_group | varchar | grupo DRE |
| active | bit | status |
| sort_order | int | ordenação |

## Hierarquia contábil

A estrutura é hierárquica utilizando `parent_id`.

Exemplo:


1 Ativo
1.1 Ativo Circulante
1.1.01 Caixa
1.1.02 Bancos


## API


GET /financial/chart-of-accounts
GET /financial/chart-of-accounts/tree
POST /financial/chart-of-accounts
PUT /financial/chart-of-accounts/{id}
PATCH /financial/chart-of-accounts/{id}/status
DELETE /financial/chart-of-accounts/{id}


## Permissões


chart_of_accounts.read
chart_of_accounts.create
chart_of_accounts.update
chart_of_accounts.delete


## Module


finance.chart_of_accounts