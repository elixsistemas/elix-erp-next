import * as React from "react";
import type { Customer } from "./customers.types";
import { listCustomers, createCustomer, updateCustomer, deleteCustomer } from "./customers.service";
import type { CustomerFormValues } from "./customers.schema";

export function useCustomers() {
  const [rows, setRows] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [q, setQ] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [editing, setEditing] = React.useState<Customer | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listCustomers(); // ✅ agora retorna Customer[]
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

  function openEdit(row: Customer) {
    setMode("edit");
    setEditing(row);
    setDialogOpen(true);
  }

  async function submit(values: CustomerFormValues) {
    setSaving(true);
    try {
      if (mode === "create") {
        await createCustomer({
          name: values.name,
          document: values.document, // ✅ obrigatório
          email: values.email ?? undefined,
          phone: values.phone ?? undefined,
        });
      } else if (editing) {
        await updateCustomer({
          id: editing.id,
          name: values.name,
          document: values.document, // ✅ obrigatório
          email: values.email ?? undefined,
          phone: values.phone ?? undefined,
        });
      }
      setDialogOpen(false);
      await reload();
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: Customer) {
    await deleteCustomer(row.id);
    await reload();
  }

  // 🔎 filtro local por nome/document/email/phone
  const filteredRows = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((r) => {
      const name = (r.name ?? "").toLowerCase();
      const doc = (r.document ?? "").toLowerCase();
      const email = (r.email ?? "").toLowerCase();
      const phone = (r.phone ?? "").toLowerCase();
      return (
        name.includes(term) ||
        doc.includes(term) ||
        email.includes(term) ||
        phone.includes(term)
      );
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
