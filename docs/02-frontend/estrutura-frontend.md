# Estrutura do Frontend (apps/web)

Este documento descreve a organização do frontend do **Elix ERP Next** (React + Vite + TypeScript), servindo como referência de arquitetura e padrão para novos módulos/telas.

## Visão geral

O frontend está organizado em camadas:

- **app/**: configuração de menu e “mapa” de navegação
- **components/**: componentes reutilizáveis (layout, auth, ui)
- **contexts/**: estado global (autenticação, branding)
- **hooks/**: hooks utilitários (menu, toast)
- **pages/**: telas do produto por domínio
- **shared/**: APIs, tipos e utilitários compartilhados

## Raiz

- `main.tsx` — bootstrap da aplicação (React root)
- `App.tsx` — composição principal (rotas/layout/providers)
- `index.css` / `App.css` — estilos base

## app/

- `app/menu.config.ts` — catálogo de itens de menu (estrutura mental do ERP)
  - Cada item pode ser filtrado por:
    - `perm` (RBAC)
    - `module` (feature gating por empresa)

> Regra: `menu.config.ts` é “mapa do produto”, não apenas navegação. Mudanças aqui refletem roadmap e módulos do ERP.

## components/

### components/layout/
- `AppShell.tsx` — layout principal (sidebar + header + conteúdo)
- `Sidebar.tsx` — sidebar desktop
- `MobileSidebar.tsx` — sidebar mobile (responsivo)
- `GlobalUiResets.tsx` — resets/ajustes globais de UI

### components/auth/
- `LoginForm.tsx` — formulário de login

### components/ui/
Componentes base (shadcn-like):
- dialog, sheet, button, table, form, input, tabs, toast, etc.

### components/
- `SwitchCompanyDialog.tsx` — troca de empresa (multiempresa)

## contexts/

- `AuthContext.tsx`
  - controla sessão do usuário, empresa atual, roles/perms
  - fonte para guards e filtros do menu

- `BrandingContext.tsx`
  - controla identidade visual (cores, logos, favicon)
  - deve ser alimentado via API de branding

## hooks/

- `useMenu.ts` — construção/filtragem do menu
- `use-toast.ts` — sistema de notificações

## lib/

- `api.ts` — wrapper simplificado de requisições
- `utils.ts` — utilitários gerais

## pages/ (telas do ERP)

As telas estão separadas por domínio (mapa mental do ERP):

### pages/admin/
- `UsersPage.tsx`
- `RolesPage.tsx`

### pages/cadastros/
- `empresa/` (CompanyPage, services, hooks, components)
- `clientes/`
- `fornecedores/`
- `produtos/`
- `contas-bancarias/`
- `fiscal/` (Base Fiscal)

Padrão recorrente por módulo:
- `*.schema.ts` (validação/types)
- `*.types.ts` (tipos do domínio)
- `*.service.ts` (API calls)
- `use*.ts` (hooks de dados)
- `components/` (tabelas, dialogs, toolbars, sheets)

### pages/comercial/
- `orcamentos/` (list/create/details/print)
- `pedidos/`
- `vendas/`
- `_shared/` (combobox, print layout, badges, etc.)

### pages/dashboard/
- `DashboardPage.tsx` + services/hooks

### pages/estoque/
- `InventoryPage.tsx`
- `InventoryMovementsPage.tsx`
- components (tabelas, dialogs, toolbars)

## shared/

### shared/api/
- `client.ts` — client HTTP (base URL, auth header, etc.)
- `auth.service.ts` — auth endpoints
- `branding.service.ts` — branding endpoints

### shared/types/
- `branding.ts` — tipos compartilhados de identidade visual

### shared/br/
Utilidades Brasil:
- masks, digits, inputs (BrDocumentInput), CEP, integrações BrasilAPI/ViaCEP, cache simples, etc.

## Convenções e boas práticas

1) **Nunca confiar no menu para segurança**
   - Menu é UX.
   - Segurança vem do backend (`requirePermission`, `requireModule`, `requireLicense`).

2) **Guards no Front**
   - Rotas devem validar permissão/módulo para evitar acesso por URL.

3) **Padrão por módulo**
   - Service + Hooks + Components + Page (organizado por domínio)

4) **Estados obrigatórios**
   - loading / empty / error em tabelas e telas

## Próximos passos recomendados

- Centralizar bootstrap de sessão (ex: `GET /auth/me`) para:
  - user + company atual
  - roles/perms
  - módulos habilitados
  - status da licença (readOnly + userLimit)

Isso destrava:
- menu dinâmico real
- guards consistentes
- telas de admin master com governança SaaS