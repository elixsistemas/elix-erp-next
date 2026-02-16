import * as React from "react";
import type { Product } from "./products.types";
import { listProducts, createProduct, updateProduct, deleteProduct } from "./products.service";
import type { ProductFormValues } from "./products.schema";

export function useProducts() {
  const [rows, setRows] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [q, setQ] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [editing, setEditing] = React.useState<Product | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listProducts();
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

  function openEdit(row: Product) {
    setMode("edit");
    setEditing(row);
    setDialogOpen(true);
  }

  async function submit(values: ProductFormValues) {
    setSaving(true);
    try {
      const payload = {
        name: values.name,
        sku: values.sku?.trim() || undefined,
        ncm: values.ncm?.trim() || undefined,
        ean: values.ean?.trim() || undefined,
        price: values.price ?? 0,
        cost: values.cost ?? 0,
      };

      if (mode === "create") {
        await createProduct(payload);
      } else if (editing) {
        await updateProduct({ id: editing.id, ...payload });
      }

      setDialogOpen(false);
      await reload();
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: Product) {
    await deleteProduct(row.id);
    await reload();
  }

  const filteredRows = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((r) => {
      const name = (r.name ?? "").toLowerCase();
      const sku = (r.sku ?? "").toLowerCase();
      const ncm = (r.ncm ?? "").toLowerCase();
      const ean = (r.ean ?? "").toLowerCase();
      return (
        name.includes(term) ||
        sku.includes(term) ||
        ncm.includes(term) ||
        ean.includes(term)
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
