# Purchase Entry XML Flow

## Objetivo

O módulo de entradas XML permite importar uma NF-e de compra para um staging controlado, revisar vínculos e dados econômicos, simular impacto antes da confirmação e só então materializar a entrada definitiva no ERP.

## Fluxo

XML
→ staging
→ revisão de fornecedor e produto
→ revisão financeira e logística
→ definição do motor econômico
→ preview antes da confirmação
→ confirmação
→ criação da entrada definitiva
→ atualização de custo e preço
→ integração de estoque
→ integração financeira

## Entidades principais

- `purchase_entry_imports`
- `purchase_entry_import_items`
- `purchase_entry_import_installments`
- `purchase_entries`
- `purchase_entry_items`
- `purchase_entry_installments`

## Motor econômico

A importação trabalha com:

- `allocation_method`
- `cost_policy`
- `price_policy`
- `markup_percent`
- `margin_percent`

### Métodos de rateio

- `VALUE`
- `QUANTITY`
- `WEIGHT`
- `MANUAL`

### Políticas de custo

- `LANDED_LAST_COST`
- `LAST_COST`
- `AVERAGE_COST`

### Políticas de preço

- `NONE`
- `MARKUP`
- `MARGIN`
- `SUGGESTED_ONLY`

## Preview antes da confirmação

O preview calcula, sem persistir a entrada definitiva:

- custo anterior do produto
- novo custo
- preço anterior
- preço sugerido
- preço aplicado
- indicação de movimentação de estoque

## Confirmação

Na confirmação o sistema:

- recalcula landed cost
- valida vínculos e consistência
- cria `purchase_entries`
- cria `purchase_entry_items`
- cria `purchase_entry_installments`
- atualiza custo do produto
- aplica política de preço
- lança estoque para itens controlados
- marca a importação como confirmada

## Observações importantes

- criação assistida de produto depende de NCM existente em `fiscal_ncm`
- para uso em produção, a base fiscal deve estar completa e atualizada
- a integração de estoque usa idempotência por item da entrada