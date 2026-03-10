# Product Kits (Composição de Kits)

O módulo de Composição de Kits define a BOM (Bill of Materials) simplificada para itens do tipo `kit`.

Ele é utilizado por:

- catálogo de itens
- vendas de kits
- decomposição futura em estoque
- relatórios de composição

## Tabela

`dbo.product_kit_items`

## Estrutura

| Campo | Tipo | Descrição |
|------|------|-----------|
| id | int | identificador |
| company_id | int | empresa |
| kit_product_id | int | item do tipo kit |
| component_product_id | int | item componente |
| quantity | decimal(18,4) | quantidade do componente |
| sort_order | int | ordenação |
| created_at | datetime2 | criação |
| updated_at | datetime2 | última atualização |

## Regras

- um kit não pode conter ele mesmo
- componentes repetidos não são permitidos
- serviços não podem compor kits nesta fase
- o kit deve existir em `products` com `kind = 'kit'`

## API

- `GET /product-kits`
- `GET /product-kits/:id`
- `PUT /product-kits`

## Permissões

- `product_kits.read`
- `product_kits.create`
- `product_kits.update`
- `product_kits.delete`

## Módulo

- `cadastros.product_kits`

## Evoluções futuras

- baixa automática de componentes na venda
- custo calculado do kit a partir dos componentes
- composição multinível
- explosão de kit em pedidos e estoque