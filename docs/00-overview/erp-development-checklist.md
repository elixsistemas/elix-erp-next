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

* [x] tabela carriers
* [x] backend
* [x] frontend
* [ ] vínculo com pedidos
* [ ] vínculo com NF

## Veiculos

Muito importante para logística.

* [x] tabela carrier_vehicles
* [x] backend
* [x] frontend
* [x] vínculo com Transportadoras

---

## Produtos

* [x] products
* [x] backend
* [x] frontend

Evoluções necessárias:

* [x] categorias
* [x] marcas
* [x] catálogo unificado por kind
* [x] tipos: product, service, consumable, kit
* [x] composição de kits
* [ ] variantes
* [ ] atributos
* [ ] múltiplos códigos de barras
* [ ] listas de preço
* [ ] anexos
* [ ] política por empresa
* [x] decisão arquitetural de serviços: catálogo unificado via products.kind
* [x] suporte inicial a kind: product, service, consumable, kit

## Composição de Kits
* [x] tabela product_kit_items
* [x] backend
* [x] frontend

---

## Serviços

ANALISAR arquitetura:

Opções:

1️⃣ tabela própria
2️⃣ products.kind

* [x] decisão tomada: reutilização de products.kind
* [x] tela dedicada por filtro kind=service
* [x] backend
* [x] frontend

---

## Unidades de medida

* [x] fiscal_uom
* [ ] padronização global

---

## Categorias de produto

* [x] tabela product_categories
* [x] backend
* [x] frontend

---

## Marcas

* [x] tabela brands
* [x] backend
* [x] frontend

---

## Centros de custo

Fundamental para financeiro e relatórios.

* [x] tabela cost_centers
* [x] CRUD backend
* [x] CRUD frontend
* [x] permissões RBAC
* [x] menu
* [x] filtros por busca/status
* [x] documentação

---

## Plano de contas

Base do financeiro real.

* [x] tabela chart_of_accounts
* [x] hierarquia contábil
* [x] backend
* [x] frontend
* [x] permissões RBAC
* [x] Permissões
* [x] Menu
* [x] hierarquia contábil (parent_id + tree API + UI em árvore)
* [x] suporte a DRE (dre_group)

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

* [x] Saldo de estoque → cálculo consolidado

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

* [x] tabela
* [x] backend
* [x] frontend
* [x] menu
* [x] docs

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

[x] entradas por XML com staging
  [x] staging de cabeçalho
  [x] staging de itens
  [x] staging de parcelas
  [x] importação XML
  [x] detecção de duplicidade por chave de acesso
  [x] validação de pertencimento do XML à empresa
  [x] revisão de vínculos fornecedor
  [x] revisão de vínculos produto
  [x] criação assistida de fornecedor
  [x] criação assistida de produto
  [x] edição de itens
  [x] edição de parcelas
  [x] edição de dados financeiros
  [x] edição logística
  [x] motor econômico no staging
  [x] edição de política de custo
  [x] edição de política de preço
  [x] edição de rateio
  [x] preview antes da confirmação
  [x] simulação de preço antes da confirmação
  [x] rateio manual por item
  [x] confirmação da importação
  [x] criação da entrada definitiva
  [x] criação dos itens definitivos
  [x] criação das parcelas definitivas
  [x] integração de contas a pagar
  [x] integração de estoque
  [x] atualização de custo do produto
  [x] aplicação de política de preço no produto
  [x] listagem de entradas definitivas
  [x] detalhe da entrada definitiva
  [x] resumo econômico pós-confirmação

[ ] solicitações de compra
[ ] cotações
[ ] pedidos de compra
[ ] entrada manual

## Pendências / evoluções do módulo de entradas XML

[ ] garantir carga completa e atualizada da tabela `fiscal_ncm` antes de uso em produção
[ ] validar fechamento automático dos rateios manuais antes da confirmação
[ ] exibir divergência entre totais do XML, duplicatas e pagamentos
[ ] calcular e exibir margem estimada no preview pré-confirmação
[ ] suportar custo médio ponderado com base no estoque anterior
[ ] persistir histórico de custo e preço por item/produto
[ ] avaliar evolução da tabela `inventory_movements` para guardar custo da movimentação
[ ] aprimorar UX da revisão de transportadora e veículo
[ ] permitir configuração padrão de política de custo/preço por empresa

# CUSTO E PRECIFICAÇÃO

[ ] cálculo de custo final (landed cost)
[ ] rateio de frete
[ ] rateio de seguro
[ ] rateio de outras despesas
[ ] desconto rateado

[ ] política de custo
  [ ] último custo
  [ ] custo médio
  [ ] custo médio ponderado

[ ] política de preço
  [ ] markup
  [ ] margem
  [ ] preço sugerido

[ ] cálculo automático de preço de venda
[ ] atualização automática de preço após compra
[ ] histórico de custos do produto
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

1️⃣ Saldo de estoque

2️⃣ Contas a pagar

3️⃣ Serviços tomados / compras

4️⃣ Reserva de estoque em pedidos

5️⃣ Relatórios comerciais

Depois disso o ERP entra em **nível estrutural equivalente a ERPs maduros**.

---

# 11. MAPA DE DEPENDÊNCIAS DO ERP

Este mapa define a ordem lógica de construção para evitar retrabalho.

## 11.1 Núcleo de plataforma

Base para todo o restante:

* Auth / sessão
* RBAC
* multiempresa
* módulos / licenciamento
* branding / configuração

Sem esse bloco, o ERP não escala com segurança.

---

## 11.2 Cadastros mestre → dependências

### Empresas

Empresas é a raiz de quase tudo:

* clientes
* fornecedores
* produtos
* serviços
* contas bancárias
* perfis fiscais
* parâmetros por empresa

---

### Clientes

Clientes alimentam:

* orçamentos
* pedidos
* vendas
* contas a receber
* documentos fiscais
* relatórios comerciais

Dependências desejáveis antes de expandir clientes:

* múltiplos endereços
* contatos
* limite de crédito

---

### Fornecedores

Fornecedores alimentam:

* compras
* contas a pagar
* entrada de estoque
* serviços tomados
* fiscal de entrada

Dependências desejáveis:

* contatos
* dados bancários
* condições comerciais

---

### Transportadoras

Transportadoras alimentam:

* pedidos
* expedição
* documentos fiscais
* frete

Dependem de:

* empresas
* cadastro base de parceiros

---

### Produtos

Produtos dependem de:

* unidades
* categorias
* marcas
* perfis fiscais
* parâmetros por empresa

Produtos alimentam:

* estoque
* orçamentos
* pedidos
* vendas
* fiscal
* relatórios

Subcadastros diretamente ligados:

* categorias
* marcas
* variantes
* atributos
* listas de preço

---

### Serviços

Serviços alimentam:

* vendas de serviço
* NFS-e
* faturamento
* financeiro

Dependem de decisão arquitetural:

* tabela própria
  ou
* reutilização de `products.kind`

---

### Contas bancárias

Contas bancárias alimentam:

* recebimentos
* pagamentos
* conciliação
* fluxo de caixa
* PIX

Dependem de:

* empresa

---

### Meios de pagamento

Meios de pagamento alimentam:

* vendas
* recebimentos
* pagamentos
* conciliação
* PDV futuro

Dependem de:

* empresa
* eventualmente contas bancárias

---

### Condições de pagamento

Condições alimentam:

* orçamentos
* pedidos
* vendas
* contas a receber
* contas a pagar

Dependem de:

* empresa

---

### Plano de contas

Plano de contas alimenta:

* contas a pagar
* contas a receber
* fluxo de caixa
* lançamentos financeiros
* DRE / relatórios

Dependências:

* empresa
* definição de estrutura hierárquica

---

### Centros de custo

Centros de custo alimentam:

* contas a pagar
* contas a receber
* fluxo de caixa
* relatórios gerenciais

Dependências:

* empresa
* idealmente plano de contas

---

## Entrada de compras via XML com staging

### Entregue
- parser de XML NF-e com preservação de strings fiscais
- staging de cabeçalho, itens e parcelas
- bloqueio de duplicidade por chave de acesso
- bloqueio de XML que não pertence à empresa atual
- criação assistida de fornecedor
- criação assistida de produto com validação de NCM
- edição de itens antes da confirmação
- edição de parcelas antes da confirmação
- classificação financeira no staging
- confirmação operacional
- geração de estoque
- geração parcelada de contas a pagar
- tratamento de conflitos com retorno `409`

### Pendências conscientes
- importação/vínculo de transportadora
- rateio de frete, desconto e despesas acessórias
- política de custo médio / último custo
- política de markup / margem / preço
- criação da entidade definitiva `purchase_entries`
- integração com pedido de compra
- three-way matching

---

### Perfis fiscais

Perfis fiscais dependem de:

* base fiscal global
* empresa
* regime tributário

Perfis fiscais alimentam:

* produtos
* serviços
* vendas
* compras
* documentos fiscais
* motor fiscal

---

## 11.3 Ordem lógica dos cadastros mestre

### Faixa A — já consolidados ou base pronta

* empresas
* clientes
* fornecedores
* produtos
* base fiscal global
* contas bancárias
* meios de pagamento
* condições de pagamento
* transportadoras
* plano de contas

### Faixa B — prioridade estrutural alta

* centros de custo
* categorias de produto
* marcas
* serviços

### Faixa C — refinamentos de maturidade

* listas de preço
* contatos e múltiplos endereços
* políticas comerciais
* dados bancários de parceiros
* variantes e atributos

---

## 11.4 Dependências por domínio processual

### Comercial depende de:

* clientes
* produtos/serviços
* condições de pagamento
* meios de pagamento
* transportadoras
* perfis fiscais

### Estoque depende de:

* produtos
* categorias
* marcas
* locais/depósitos
* regras fiscais mínimas

### Fiscal depende de:

* base fiscal global
* perfis fiscais
* clientes
* fornecedores
* produtos/serviços
* operações comerciais

### Financeiro depende de:

* contas bancárias
* meios de pagamento
* condições de pagamento
* plano de contas
* centros de custo
* clientes/fornecedores
* documentos de origem (venda/compra)

### Compras depende de:

* fornecedores
* produtos/serviços
* condições de pagamento
* centros de custo
* plano de contas

---

## 11.5 Ordem recomendada de construção a partir de agora

### Etapa 1 — completar cadastros mestre faltantes

1. Transportadoras
2. Plano de contas
3. Centros de custo
4. Marcas
5. Categorias de produto
6. Serviços

### Etapa 2 — consolidar cadastros avançados

1. contatos/endereços de clientes
2. contatos/endereços de fornecedores
3. listas de preço
4. políticas comerciais
5. perfis fiscais ampliados

### Etapa 3 — entrar nos módulos processuais com base sólida

1. compras
2. financeiro operacional
3. fiscal operacional
4. expedição/devoluções
5. relatórios gerenciais

---

## 11.6 Regra prática para próximos chats

Antes de iniciar um novo módulo:

1. revisar este checklist
2. verificar dependências já prontas
3. confirmar se o módulo é cadastro mestre ou processo
4. preferir concluir os cadastros da etapa atual antes de abrir processos dependentes
5. ao fim do ciclo, atualizar checklist + mapa de dependências
