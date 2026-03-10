# Services (Serviços)

O módulo de Serviços define a visão dedicada para itens do catálogo unificado cujo `kind = service`.

Serviços não possuem tabela própria.

Eles são persistidos em `dbo.products` com:

- `kind = 'service'`
- `track_inventory = 0`
- sem NCM
- sem CEST
- sem dados logísticos

## Tabela base

`dbo.products`

## API

- `GET /services`
- `GET /services/:id`
- `POST /services`
- `PATCH /services/:id`
- `DELETE /services/:id`

## Permissões

- `services.read`
- `services.create`
- `services.update`
- `services.delete`

## Módulo

- `cadastros.services`

## Observações

A implementação atual reaproveita o catálogo unificado de itens e especializa a experiência de uso para serviços, sem duplicar domínio.