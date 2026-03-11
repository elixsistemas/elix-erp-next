# ADR 0006 — Importação de XML de entrada com staging obrigatório

## Status
Aceito

## Contexto
A importação de XML de entrada pode impactar múltiplos domínios operacionais:
- fornecedores
- estoque
- financeiro
- fiscal

Uma importação direta para o operacional aumenta o risco de:
- duplicidade de fornecedores
- duplicidade de produtos
- entradas indevidas em estoque
- títulos financeiros incorretos

## Decisão
Toda importação de XML de entrada seguirá fluxo em duas etapas:

1. importação para staging
2. confirmação operacional explícita

O upload do XML não gera automaticamente:
- movimentos de estoque
- contas a pagar
- documentos fiscais operacionais

Esses efeitos só são executados após confirmação da importação.

## Consequências
### Positivas
- maior segurança operacional
- revisão antes de efetivar
- melhor rastreabilidade
- menor risco de duplicidade

### Negativas
- um passo adicional de validação
- maior esforço inicial de implementação

## Fluxo
XML → staging → revisão/match → confirmação → estoque + financeiro