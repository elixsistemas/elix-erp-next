# Elix ERP Next — Guia de Ciclo por Módulo (Workflow Oficial)

Este documento define o **processo padrão de desenvolvimento** do Elix ERP Next.
O objetivo é manter o ERP evoluindo com **qualidade**, **coerência arquitetural** e **previsibilidade**.

> Regra de ouro: nenhuma feature é considerada “pronta” se não passou pelo ciclo completo.

---

## 0) Premissas

O Elix ERP Next é um ERP SaaS multiempresa e modular, portanto:

- Segurança vem do backend (RBAC, módulo, licença) — nunca do menu.
- Multiempresa exige escopo por `company_id` e vínculos consistentes (ex: `user_companies`).
- Módulos do produto devem existir no **Module Catalog** e ser habilitados por empresa em `company_modules`.
- Toda mudança relevante deve ser documentada no `docs/`.

---

## 1) Ciclo padrão por módulo

### 1) DB — Banco de dados (fundação)
Entregáveis:
- migrations (tabelas/colunas/constraints)
- índices necessários
- seeds (dados iniciais quando aplicável)

Checklist:
- [ ] tabela(s) criada(s) com nomes consistentes
- [ ] constraints e defaults definidos
- [ ] índices para consultas críticas
- [ ] seed idempotente quando necessário
- [ ] validação do impacto em multiempresa (company_id / vínculos)

---

### 2) API — Backend (regra do negócio + segurança)
Entregáveis (padrão por módulo):
- `*.repository.ts` — acesso a dados (SQL)
- `*.service.ts` — regras de negócio (quando existe lógica)
- `*.controller.ts` — camada HTTP (Fastify)
- `*.routes.ts` — rotas + middlewares
- `*.schema.ts`/`*.schemas.ts` — validação (Zod)

Checklist:
- [ ] rotas com `requireAuth`
- [ ] rotas com `requirePermission("x.y")`
- [ ] rotas com `requireModule("module_key")` quando aplicável
- [ ] rotas com `requireLicense` em operações de escrita (POST/PUT/PATCH/DELETE)
- [ ] service centraliza regra (evita duplicidade no controller)
- [ ] erros retornam mensagens UX em pt-BR (sem vazar SQL/stack)

Regras rápidas:
- Repository não decide regra de negócio.
- Controller não deve conter lógica pesada.
- Service é onde vivem limites (licença), validações e políticas.

---

### 3) Front — UX (telas + menu + guards)
Entregáveis:
- páginas em `src/pages/<dominio>/...`
- services/hooks por módulo (ex: `*.service.ts`, `use*.ts`)
- componentes (tabela, toolbar, dialogs, sheets)
- rotas registradas
- menu atualizado

Checklist:
- [ ] item no `menu.config.ts` com `module` e `perm` quando aplicável
- [ ] menu filtra por:
  - permissões (RBAC)
  - módulos habilitados (company_modules)
- [ ] guard nas rotas (perm/module) para bloquear acesso por URL
- [ ] estados completos:
  - loading
  - empty
  - error
- [ ] feedback UX padronizado (toast/dialog)
- [ ] ações de escrita respeitam `license.readOnly` (UX)

---

### 4) Docs — documentação como fonte de verdade
Entregáveis:
- atualizar Capability Map (produto)
- atualizar Module Catalog (catálogo de módulos)
- atualizar Data Model (quando tabelas mudam)
- criar ADR quando houver decisão arquitetural relevante

Checklist:
- [ ] `docs/01-data-model/...` atualizado quando houver mudança de schema
- [ ] `docs/00-overview/product-capability-map.md` atualizado quando entrar capacidade nova
- [ ] `docs/00-overview/module-catalog.md` atualizado quando entrar módulo novo
- [ ] `docs/adr/` criado quando houver decisão que muda padrão/rumo

> Documento bom reduz bugs futuros e evita re-trabalho.

---

### 5) Commit — fechamento do ciclo
Regras:
- commits pequenos e objetivos
- mensagem clara (convenção sugerida)

Padrões de mensagem:
- `feat(modulo): ...`
- `fix(modulo): ...`
- `docs: ...`
- `refactor(modulo): ...`

Checklist:
- [ ] `git status` limpo (só o que faz sentido)
- [ ] build ok (quando aplicável)
- [ ] commit com escopo
- [ ] push

---

## 2) Definição de “Pronto” (Definition of Done)

Uma tarefa só é “Pronta” quando:

- DB está migrado + indexado
- API está com rotas + RBAC + módulo/licença aplicados quando necessário
- Front está com telas e estados completos + guard de rota
- Docs atualizadas (pelo menos o essencial)
- Commit feito e testado (mínimo)

---

## 3) Governança do menu (UX como mapa mental do produto)

O menu é o mapa do ERP.
Ele deve refletir a arquitetura do produto e não ser “lista de telas”.

Regras:
- `module_key` representa capacidade do produto (ex: `admin.users`)
- `perm` representa ação/visibilidade (ex: `users.read`)
- não criar `module_key` por sub-tela (evitar granularidade excessiva)

---

## 4) Exemplo de execução do ciclo (Users + Licensing)

1) DB: índice para contagem de assentos por empresa  
2) API: `requireLicense` + regra de limite no service  
3) Front: bloquear “Novo usuário” quando lotado / tratar erro 409  
4) Docs: registrar regra de assentos e tabelas relacionadas  
5) Commit: `feat(users): enforce license seat limit`

---

## 5) Onde este workflow se aplica

Aplica em TODOS os módulos:
- Comercial, Financeiro, Fiscal, Estoque, Cadastros, Admin, Relatórios, etc.

---

## 6) Nota final

Este workflow existe para garantir que o Elix ERP Next seja:
- sustentável
- escalável
- consistente
- auditável
- pronto para operação SaaS real

“ERP sério” não é o que tem mais telas.
É o que tem melhor disciplina de produto.