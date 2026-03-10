# ADR 0004 — Catálogo de Itens unificado em products.kind

## Status
Aprovado

## Contexto
O ERP precisava decidir como modelar serviços:
- tabela própria `services`
- ou evolução do módulo `products`

O módulo `products` já existia e já possuía o campo `kind`, inicialmente com suporte a `product` e `service`.

## Decisão
Adotar um catálogo unificado de itens baseado em `products.kind`, expandindo o domínio para:

- product
- service
- consumable
- kit

## Consequências
- evita duplicação de domínio comercial
- evita duplicação em orçamento, pedidos, vendas e faturamento
- mantém uma única fonte de verdade para itens comercializáveis
- permite visões específicas por tipo no frontend

## Evoluções futuras
- tela dedicada de serviços
- composição de kits
- políticas de estoque por tipo
- pricing e fiscal por tipo de item