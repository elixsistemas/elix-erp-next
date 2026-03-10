
# Elix ERP Next — Module Catalog

## O que é

O **Module Catalog** é a lista oficial de módulos do ERP.

Ele define **quais capacidades existem no sistema**, independentemente de empresa.

Tabela:

modules_catalog

Essa tabela representa o **catálogo de funcionalidades do produto**.

---

## Estrutura

| Campo | Descrição |
|------|-----------|
| module_key | chave única do módulo |
| domain | domínio do ERP |
| label | nome exibido na UI |
| description | descrição funcional |
| sort_order | ordem no menu |
| active | se o módulo está ativo no ERP |

---

## Domínios do ERP

core  
commercial  
finance  
fiscal  
inventory  
cadastros  
reports  
admin  

---

## Relação com company_modules

modules_catalog define **o que existe**.

company_modules define **o que a empresa usa**.

Exemplo:

Empresa A  
- commercial.sales
- finance.receivables

Empresa B  
- commercial.sales

---

## Como o sistema usa

### Backend

middleware:

requireModule("commercial.sales")

### Frontend

menu.config.ts filtra:

- permissões
- company_modules

---

## Benefícios

Permite:

• ERP modular SaaS  
• planos comerciais  
• ativação por empresa  
• menu dinâmico  
• governança de arquitetura  

---

## Regra importante

module_key representa **capacidade de produto**.

Não deve ser criado para cada tela.

Exemplo correto:

commercial.sales

Exemplo errado:

sales.create.modal


| finance.payables | Financeiro | Contas a pagar | Gestão de títulos e obrigações financeiras com fornecedores |

