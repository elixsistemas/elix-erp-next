# Product Categories (Categorias de Produto)

O módulo de Categorias de Produto define a estrutura hierárquica de classificação do catálogo de produtos do ERP.

Ele é utilizado por:

- cadastro de produtos
- filtros e navegação
- relatórios comerciais
- análises de estoque
- análises de vendas
- integrações futuras com fiscal, pricing e BI

## Tabela

`dbo.product_categories`

## Estrutura

| Campo | Tipo | Descrição |
|------|------|-----------|
| id | int | identificador |
| company_id | int | empresa |
| parent_id | int | categoria pai |
| code | varchar(30) | código da categoria |
| name | nvarchar(150) | nome |
| active | bit | status |
| sort_order | int | ordenação |
| created_at | datetime2 | criação |
| updated_at | datetime2 | última atualização |

## Hierarquia

A estrutura é hierárquica utilizando `parent_id`.

Exemplo:

Eletrônicos  
└── Informática  
└── Celulares  
└── Acessórios  

## API

- `GET /product-categories`
- `GET /product-categories/tree`
- `GET /product-categories/:id`
- `POST /product-categories`
- `PATCH /product-categories/:id`
- `DELETE /product-categories/:id`

## Permissões

- `product_categories.read`
- `product_categories.create`
- `product_categories.update`
- `product_categories.delete`

## Módulo

- `cadastros.product_categories`

## Observações

A implementação atual já nasce preparada para:

- subcategorias
- filtros hierárquicos
- vínculo futuro em produtos
- análises por grupo de produto
- expansão para pricing/fiscal/BI