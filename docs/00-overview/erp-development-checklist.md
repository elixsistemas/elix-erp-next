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

1️⃣ Plano de contas

2️⃣ Centros de custo

3️⃣ Categorias de produtos

4️⃣ Serviços

5️⃣ 

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

### Faixa B — prioridade estrutural alta

* transportadoras
* plano de contas
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
2. Categorias de produto
3. Marcas
4. Plano de contas
5. Centros de custo
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
