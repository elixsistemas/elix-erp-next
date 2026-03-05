# ADR 0003 — Receivables Naming

## Status

Proposed

---

# Contexto

Atualmente existem dois módulos relacionados a contas a receber:

```
accounts_receivable
receivables
```

Isso gera ambiguidade no sistema.

---

# Problema

Dois nomes diferentes representam o mesmo domínio financeiro.

Isso pode gerar:

* confusão na API
* confusão no frontend
* inconsistência na arquitetura

---

# Decisão Proposta

Padronizar o domínio financeiro usando o nome:

```
receivables
```

Motivo:

* mais curto
* mais comum em ERPs
* consistente com nomenclatura internacional

---

# Consequências

Arquivos futuros devem seguir o padrão:

```
receivables.controller.ts
receivables.service.ts
receivables.repository.ts
```

Caso o módulo `accounts_receivable` seja mantido por compatibilidade, ele deverá ser marcado como **deprecated**.
