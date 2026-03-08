# Cadastros Financeiros

Este documento descreve os módulos básicos financeiros do Elix ERP Next.

Módulos incluídos:

- Contas Bancárias
- Meios de Pagamento
- Condições de Pagamento

Arquitetura aplicada:

tabela → backend → frontend

---

# Bank Accounts

Responsável por representar contas bancárias da empresa utilizadas em:

- recebimentos
- pagamentos
- conciliação bancária
- geração de títulos
- integração PIX

## Campos principais

bank_code  
bank_name  
agency  
branch_digit  
account  
account_digit  

holder_name  
holder_document  

pix_key_type  
pix_key_value  

account_type  
is_default  

allow_receipts  
allow_payments  

reconciliation_enabled  

external_code  
notes  

active  

## Observação técnica

O campo `pix_key_type` no frontend utiliza o valor especial `"none"` para representar ausência de chave, pois o componente Select (Radix UI) não aceita `""`.

Esse valor é convertido para `null` antes de enviar para a API.

---

# Payment Methods

Representa os meios de pagamento aceitos pela empresa.

Exemplos:

- dinheiro
- cartão crédito
- cartão débito
- PIX
- boleto

## Uso no sistema

Utilizado em:

- vendas
- recebimentos
- contas a receber
- integração adquirentes

## Permissões

payment_methods.read  
payment_methods.create  
payment_methods.update  
payment_methods.delete  

---

# Payment Terms

Representa condições comerciais de pagamento.

Exemplos:

- à vista
- 30 dias
- 30/60
- 30/60/90

## Estrutura

code  
name  
days  
installments  
active  

## Uso

- vendas
- pedidos
- faturamento
- contas a receber

---

# Observação arquitetural

Esses três módulos formam a base financeira do ERP e serão utilizados posteriormente em:

- Contas a Receber
- Contas a Pagar
- Fluxo de Caixa
- Conciliação Bancária