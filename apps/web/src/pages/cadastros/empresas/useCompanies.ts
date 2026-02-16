import * as React from "react";
import type { Company } from "./companies.types";
import { listCompanies, createCompany, updateCompany, deleteCompany } from "./companies.service";
import type { CompanyFormValues } from "./companies.schema";

export function useCompanies() {
  const [rows, setRows] = React.useState<Company[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // se o backend não suporta busca/paginação, mantenha só no front (filtro local)
  const [q, setQ] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [editing, setEditing] = React.useState<Company | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listCompanies(); // ✅ agora retorna Company[]
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    reload();
  }, [reload]);

  function openCreate() {
    setMode("create");
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(row: Company) {
    setMode("edit");
    setEditing(row);
    setDialogOpen(true);
  }

  async function submit(values: CompanyFormValues) {
    setSaving(true);
    try {
      if (mode === "create") {
        // ⚠️ só funciona se você tiver POST /companies no backend
        await createCompany({ name: values.name, cnpj: values.cnpj ?? null });
      } else if (editing) {
        // ✅ compatível com PATCH /companies/me (service adapta)
        await updateCompany({ id: editing.id, name: values.name, cnpj: values.cnpj ?? null });
      }
      setDialogOpen(false);
      await reload();
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: Company) {
    // ⚠️ só funciona se você tiver DELETE /companies/:id no backend
    await deleteCompany(row.id);
    await reload();
  }

  // filtro local (caso queira manter busca)
  const filteredRows = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => {
      const name = (r.name ?? "").toLowerCase();
      const cnpj = (r.cnpj ?? "").toLowerCase();
      return name.includes(term) || cnpj.includes(term);
    });
  }, [rows, q]);

  return {
    rows: filteredRows,
    loading,
    saving,
    q,
    setQ,
    total: filteredRows.length,

    dialogOpen,
    setDialogOpen,
    mode,
    editing,

    openCreate,
    openEdit,
    submit,
    remove,
    reload,
  };
}
