# Brands (Marcas)

O módulo de Marcas define o cadastro de marcas utilizado na classificação comercial e analítica dos produtos do ERP.

Ele é utilizado por:

- cadastro de produtos
- filtros de catálogo
- relatórios comerciais
- análises de estoque
- análises de vendas
- integrações futuras com pricing, BI e políticas comerciais

## Tabela

`dbo.brands`

## Estrutura

| Campo | Tipo | Descrição |
|------|------|-----------|
| id | int | identificador |
| company_id | int | empresa |
| code | varchar(30) | código da marca |
| name | nvarchar(150) | nome |
| active | bit | status |
| sort_order | int | ordenação |
| created_at | datetime2 | criação |
| updated_at | datetime2 | última atualização |

## API

- `GET /brands`
- `GET /brands/:id`
- `POST /brands`
- `PATCH /brands/:id`
- `DELETE /brands/:id`

## Permissões

- `brands.read`
- `brands.create`
- `brands.update`
- `brands.delete`

## Módulo

- `cadastros.brands`

## Observações

A implementação atual nasce preparada para:

- vínculo futuro em produtos
- filtros comerciais por marca
- relatórios de giro por marca
- análises de venda por fabricante
- expansão para políticas comerciais e BI