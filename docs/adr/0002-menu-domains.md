# ADR 0002 — Menu Domains

## Status

Accepted

---

# Contexto

O menu do ERP representa os domínios funcionais do sistema.

Ele funciona como um **mapa mental da aplicação**.

Arquivo responsável:

```
apps/web/src/app/menu.config.ts
```

---

# Decisão

O menu do sistema deve ser organizado por domínio de negócio.

Estrutura definida:

```
Dashboard

Comercial
   Orçamentos
   Pedidos
   Vendas
   Expedição
   Devoluções

Financeiro
   Contas a Receber
   Contas a Pagar
   Fluxo de Caixa
   Conciliação

Fiscal
   Documentos
   NF-e
   NFS-e
   Regras Tributárias

Estoque
   Saldo
   Movimentações
   Inventário
   Locais

Cadastros
   Empresas
   Clientes
   Fornecedores
   Produtos
   Serviços
   Contas Bancárias
   Meios de Pagamento
   Condições

Relatórios
   Vendas
   Financeiro
   Estoque
   Fiscal

Administração
   Usuários
   Perfis e Permissões
   Configurações
   Auditoria
```

---

# Consequências

O menu deve refletir:

* os domínios do ERP
* os módulos do backend
* as permissões do sistema

Isso mantém consistência entre:

* frontend
* backend
* banco de dados
