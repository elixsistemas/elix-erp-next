# Elix ERP Next — ERP Development Checklist

Documento vivo que representa o **mapa evolutivo completo do ERP**.
Ele deve refletir o estado real do produto e ser atualizado ao final de cada ciclo.

Princípio de engenharia:

Um módulo só é considerado concluído quando fecha o ciclo:

DB → API → WEB → DOCS → QA → COMMIT

Legenda:

* [x] concluído
* [~] em andamento
* [ ] pendente
* ANALISAR decisão arquitetural necessária

---

# 0. CORE / PLATAFORMA

Infraestrutura base do ERP.

## Auth / Sessão

* [x] prelogin
* [x] login
* [x] JWT
* [x] multiempresa
* [ ] refresh token
* [ ] revogação de sessão
* [ ] auditoria de login

## RBAC

* [x] users
* [x] roles
* [x] permissions
* [x] role_permissions
* [x] user_roles
* [x] guards por permissão
* [x] guards por módulo
* [ ] segregação de função

## Licenciamento

* [x] licensing_plans
* [x] company_license
* [x] modules_catalog
* [x] company_modules
* [ ] controle avançado por plano
* [ ] telemetria de uso

## Auditoria

* [ ] audit_log
* [ ] histórico por entidade
* [ ] trilha de alterações

## Configuração da empresa

* [x] companies
* [x] EmpresaConfig
* [x] company_branding
* [ ] consolidação de configurações
* [ ] parâmetros globais

---

# 1. CADASTROS (MASTER DATA)

Base de dados estruturais que alimentam todos os processos.

## Empresas

* [x] companies
* [x] backend
* [x] frontend
* [ ] parâmetros comerciais
* [ ] parâmetros fiscais
* [ ] parâmetros financeiros

---

## Clientes

* [x] customers
* [x] backend
* [x] frontend

Evoluções esperadas:

* [ ] contatos
* [ ] múltiplos endereços
* [ ] limite de crédito
* [ ] classificação
* [ ] histórico financeiro

---

## Fornecedores

* [x] suppliers
* [x] backend
* [x] frontend

Evoluções:

* [ ] contatos
* [ ] múltiplos endereços
* [ ] dados bancários
* [ ] condições comerciais padrão

---

## Transportadoras

Muito importante para logística.

* [ ] tabela transportadoras
* [ ] backend
* [ ] frontend
* [ ] vínculo com pedidos
* [ ] vínculo com NF

---

## Produtos

* [x] products
* [x] backend
* [x] frontend

Evoluções necessárias:

* [ ] categorias
* [ ] marcas
* [ ] variantes
* [ ] atributos
* [ ] múltiplos códigos de barras
* [ ] listas de preço
* [ ] anexos
* [ ] política por empresa

---

## Serviços

ANALISAR arquitetura:

Opções:

1️⃣ tabela própria
2️⃣ products.kind

* [ ] decisão arquitetural
* [ ] backend
* [ ] frontend

---

## Unidades de medida

* [x] fiscal_uom
* [ ] padronização global

---

## Categorias de produto

* [ ] tabela categorias
* [ ] backend
* [ ] frontend

---

## Marcas

* [ ] tabela marcas
* [ ] backend
* [ ] frontend

---

## Centros de custo

Fundamental para financeiro e relatórios.

* [ ] tabela centros_custo
* [ ] backend
* [ ] frontend

---

## Plano de contas

Base do financeiro real.

* [ ] tabela plano_contas
* [ ] hierarquia contábil
* [ ] backend
* [ ] frontend

---

## Contas bancárias

* [x] tabela
* [x] backend
* [x] frontend
* [x] conta padrão
* [x] PIX
* [x] conciliação futura

---

## Meios de pagamento

* [x] tabela
* [x] backend
* [x] frontend

Evolução:

* [ ] integração recebimentos

---

## Condições de pagamento

* [x] tabela
* [x] backend
* [x] frontend

Evolução:

* [ ] parcelas detalhadas

---

## Perfis fiscais

* [x] company_tax_profiles

Evolução:

* [ ] vigência
* [ ] regras por operação
* [ ] vínculo produto
* [ ] vínculo cliente

---

# 2. COMERCIAL

Processos de venda.

## Orçamentos

* [x] quotes
* [x] quote_items

Evolução:

* [ ] aprovação
* [ ] histórico

---

## Pedidos

* [x] orders
* [x] order_items

Evolução:

* [ ] aprovação
* [ ] reserva estoque

---

## Vendas

* [x] sales
* [x] sale_items

Evolução:

* [ ] integração financeiro
* [ ] integração fiscal

---

## Devoluções

* [ ] tabela
* [ ] backend
* [ ] frontend

---

## Expedição

* [ ] tabela
* [ ] backend
* [ ] frontend

---

# 3. ESTOQUE

## Movimentações

* [x] inventory_movements

---

## Saldo de estoque

* [ ] cálculo consolidado

---

## Locais / depósitos

* [ ] tabela
* [ ] backend
* [ ] frontend

---

## Inventário

* [ ] contagem
* [ ] divergência

---

## Lote / série

* [ ] rastreabilidade

---

# 4. FISCAL

## Base fiscal

* [x] NCM
* [x] CEST
* [x] CFOP
* [x] CST

---

## Motor fiscal

* [x] estrutura inicial

Evolução:

* [ ] regras tributárias
* [ ] cenários interestaduais

---

## Documentos fiscais

* [x] fiscal_documents
* [x] fiscal_document_items

Evolução:

* [ ] emissão NF-e
* [ ] emissão NFS-e

---

# 5. FINANCEIRO

## Contas a receber

* [x] accounts_receivable

Evolução:

* [ ] baixas
* [ ] juros
* [ ] renegociação

---

## Contas a pagar

* [ ] tabela
* [ ] backend
* [ ] frontend

---

## Pagamentos

* [ ] execução pagamentos

---

## Fluxo de caixa

* [ ] projeção
* [ ] realizado

---

## Conciliação bancária

* [ ] importação extrato
* [ ] matching automático

---

# 6. COMPRAS

Muito comum em ERPs maduros.

* [ ] solicitações compra
* [ ] cotações
* [ ] pedidos compra
* [ ] entrada estoque

---

# 7. RELATÓRIOS / BI

## Financeiro

* [ ] fluxo caixa
* [ ] inadimplência

---

## Comercial

* [ ] vendas

---

## Estoque

* [ ] giro

---

## Fiscal

* [ ] tributos

---

# 8. INTEGRAÇÕES

* [ ] bancos
* [ ] PIX
* [ ] gateways
* [ ] documentos fiscais

---

# 9. CICLO MAIS RECENTE

Cadastros financeiros básicos concluídos:

* [x] contas bancárias
* [x] meios de pagamento
* [x] condições de pagamento

---

# 10. PRÓXIMOS CANDIDATOS

Sugestão arquitetural:

1️⃣ Transportadoras

2️⃣ Plano de contas

3️⃣ Centros de custo

4️⃣ Categorias de produtos

5️⃣ Serviços

Depois disso o ERP entra em **nível estrutural equivalente a ERPs maduros**.
