import * as React from "react";
import { toast } from "sonner";
import {
  getProductKit,
  listProductKits,
  upsertProductKit,
} from "./product-kits.service";
import type {
  ProductKitDetails,
  ProductKitUpsertPayload,
  ProductKitRow,
} from "./product-kits.types";

export function useProductKits() {
  const [rows, setRows] = React.useState<ProductKitRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const [editing, setEditing] = React.useState<ProductKitDetails | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listProductKits(q.trim() || undefined);
      setRows(data);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao listar kits");
    } finally {
      setLoading(false);
    }
  }, [q]);

  React.useEffect(() => {
    const t = setTimeout(() => void reload(), 300);
    return () => clearTimeout(t);
  }, [reload]);

  async function onEdit(row: ProductKitRow) {
    try {
      const full = await getProductKit(row.id);
      setEditing(full);
      setOpen(true);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao carregar composição");
    }
  }

  async function onSubmit(payload: ProductKitUpsertPayload) {
    setSaving(true);
    try {
      await upsertProductKit(payload);
      toast.success("Composição do kit salva");
      setOpen(false);
      setEditing(null);
      await reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao salvar composição");
    } finally {
      setSaving(false);
    }
  }

  return {
    rows,
    loading,
    saving,
    q,
    setQ,
    open,
    setOpen,
    editing,
    setEditing,
    reload,
    onEdit,
    onSubmit,
  };
}