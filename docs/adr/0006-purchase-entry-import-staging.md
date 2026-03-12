# ADR 0006 — Entrada de compras via XML com staging e confirmação operacional

## Status
Aceita

## Contexto
O ERP precisava de uma porta de entrada operacional para compras baseada em XML de NF-e, sem lançar efeitos imediatos em estoque e financeiro antes de conferência.

## Decisão
Foi adotado um fluxo com staging:

1. Upload do XML
2. Parsing e validações iniciais
3. Persistência em tabelas de staging:
   - `purchase_entry_imports`
   - `purchase_entry_import_items`
   - `purchase_entry_import_installments`
4. Conferência operacional:
   - vínculo/criação de fornecedor
   - vínculo/criação de produto
   - revisão de itens e parcelas
   - classificação financeira
5. Confirmação explícita
6. Geração operacional:
   - `inventory_movements`
   - `accounts_payable`

## Regras importantes
- XML duplicado na mesma empresa retorna conflito (`409`)
- XML cujo destinatário não corresponde à empresa logada retorna conflito (`409`)
- fornecedor e produto precisam estar vinculados antes da confirmação
- parcelas do XML geram múltiplos títulos no contas a pagar
- produto criado automaticamente recebe:
  - `cost = valor unitário do XML`
  - `price = 0`
- dados fiscais do XML são preservados como string no parser

## Consequências
### Positivas
- evita efeitos operacionais prematuros
- permite revisão antes de confirmar
- prepara o módulo para evoluir para compras estruturadas
- aumenta rastreabilidade por `source_type/source_id`

### Negativas / trade-offs
- aumenta número de tabelas e estados
- exige maior disciplina de UX na tela de conferência
- ainda depende de evoluções futuras para virar compras completas