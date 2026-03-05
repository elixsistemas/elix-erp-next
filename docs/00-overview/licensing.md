# Elix ERP Next — Licensing (Modelo SaaS)

Este documento define o conceito de **licenciamento** do Elix ERP Next (SaaS).

Ele cobre:
- limite de usuários por empresa (licença)
- bloqueio progressivo por inadimplência (read-only)
- base para planos (Starter/Pro/Enterprise)
- enforcement no backend (não só no menu)

---

## 1) Conceitos

### Planos (produto)
O ERP tem um catálogo de planos com:
- limite de usuários
- período de carência (grace period)
- descrição (para UI/marketing)

Tabela: `dbo.licensing_plans`

### Licença por empresa (tenant)
Cada empresa tem uma licença vigente com:
- status
- data de vencimento (`due_at`)
- override de limite (opcional)

Tabela: `dbo.company_license`

---

## 2) Status e política

- `active`: uso normal
- `past_due`: passou do vencimento, ainda opera durante a carência
- `suspended`: passou da carência → **somente leitura**
- `canceled`: cancelada → **somente leitura**

Política MVP:
- `suspended` e `canceled` bloqueiam **POST/PUT/PATCH/DELETE**
- `GET` continua funcionando (read-only)

---

## 3) Onde aplicar no backend

Middleware: `apps/api/src/config/requireLicense.ts`

Aplicar em rotas protegidas junto com auth/permission:
- `requireAuth` (JWT)
- `requireLicense` (status da licença e read-only)
- `requirePermission` (RBAC)

---

## 4) Limite de usuários

Regra:
- ao criar/ativar usuário, validar `license.userLimit`
- considerar apenas usuários ativos da empresa

Recomendação:
- colocar a verificação no `users.service.ts` para centralizar

---

## 5) Frontend (UX)

O frontend não decide segurança, mas pode:
- mostrar banner “licença vencida/suspensa”
- desabilitar botões de ação (UX)
- bloquear formulários de cadastro

Dados recomendados via API:
- `GET /auth/me` retornar `license` + `enabledModules` + `perms`

---

## 6) Roadmap

MVP (agora):
- licenças por empresa
- read-only automático após carência
- limite de usuários

Depois:
- integração de cobrança (Stripe/Mercado Pago)
- webhooks: pagamento aprovado → `status=active`
- planos ativando conjuntos de `module_key` (modules_catalog + company_modules)
