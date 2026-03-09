# Centros de Custo

O módulo de **Centros de Custo** define a estrutura analítica usada para classificar receitas, despesas e lançamentos por área da empresa.

Ele complementa o plano de contas ao responder **onde** um evento financeiro aconteceu, enquanto a conta contábil responde **o que** aquele valor representa.

## Objetivo

Permitir análise financeira por área, setor, departamento ou unidade operacional.

Exemplos:

- Administração
- Comercial
- Produção
- Logística
- Tecnologia
- Diretoria

## Tabela

`dbo.cost_centers`

## Estrutura

| Campo | Tipo | Descrição |
|------|------|-----------|
| id | int | Identificador |
| company_id | int | Empresa |
| code | varchar(20) | Código do centro de custo |
| name | nvarchar(150) | Nome |
| active | bit | Status ativo/inativo |
| sort_order | int | Ordenação |
| created_at | datetime2 | Criação |
| updated_at | datetime2 | Última atualização |

## Regras atuais

- unicidade por empresa em `code`
- escopo multiempresa por `company_id`
- suporte a ativação/inativação
- ordenação por `sort_order`
- CRUD completo via API e frontend

## API

- `GET /cost-centers`
- `GET /cost-centers/:id`
- `POST /cost-centers`
- `PATCH /cost-centers/:id`
- `DELETE /cost-centers/:id`

## Permissões

- `cost_centers.read`
- `cost_centers.create`
- `cost_centers.update`
- `cost_centers.delete`

## Módulo

- `finance.cost_centers`

## Uso no ERP

Centros de custo serão usados em:

- financeiro
- contas a pagar
- contas a receber
- relatórios analíticos
- DRE analítica
- lançamentos contábeis futuros

## Seed inicial sugerido

Exemplos de centros amplamente utilizados:

- 1000 Operações
- 1100 Produção
- 1200 Logística
- 2000 Administração
- 2100 Recursos Humanos
- 3000 Comercial
- 3100 Vendas
- 3200 Marketing
- 4000 Financeiro
- 4300 Controladoria
- 5000 Tecnologia da Informação
- 9000 Diretoria

## Observações de evolução

A versão atual foi implementada sem hierarquia (`parent_id`), priorizando simplicidade e adoção rápida.

Caso necessário, o módulo poderá evoluir para:

- hierarquia de centros de custo
- classificação por tipo
- vínculo com projetos
- vínculo com unidades de negócio
- análises por estrutura organizacional