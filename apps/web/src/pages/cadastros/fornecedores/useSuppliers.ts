import * as React from "react";
import { toast } from "sonner";
import type { Supplier, SupplierCreate, SupplierUpdate } from "./suppliers.types";
import { createSupplier, deleteSupplier, listSuppliers, updateSupplier } from "./suppliers.service";
import { SupplierUpsertSchema, type SupplierUpsertForm } from "./suppliers.schema";
import { onlyDigits } from "@/shared/br/digits";

type Mode = "create" | "edit";

export function useSuppliers() {
  const [rows, setRows] = React.useState<Supplier[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [q, setQ] = React.useState("");
  const [showInactive, setShowInactive] = React.useState(false);

  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("create");
  const [editing, setEditing] = React.useState<Supplier | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSuppliers({
        q: q.trim() ? q.trim() : undefined,
        limit: 50,
        active: showInactive ? undefined : 1,
      });
      setRows(data);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao listar fornecedores");
    } finally {
      setLoading(false);
    }
  }, [q, showInactive]);

  React.useEffect(() => {
    const t = setTimeout(() => void reload(), 350);
    return () => clearTimeout(t);
  }, [q, showInactive, reload]);

  function onCreate() {
    setMode("create");
    setEditing(null);
    setOpen(true);
  }

  function onEdit(row: Supplier) {
    setMode("edit");
    setEditing(row);
    setOpen(true);
  }

  async function onRemove(row: Supplier) {
    if (!confirm(`Desativar o fornecedor "${row.name}"?`)) return;

    try {
      await deleteSupplier(row.id);
      toast.success("Fornecedor desativado");
      await reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao desativar fornecedor");
    }
  }

  async function onSubmit(form: SupplierUpsertForm) {
    const parsed = SupplierUpsertSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues?.[0]?.message ?? "Validação falhou");
      return;
    }

    setSaving(true);
    try {
      const payload = sanitizePayload(parsed.data);

      if (mode === "create") {
        await createSupplier(payload as SupplierCreate);
        toast.success("Fornecedor criado");
      } else {
        if (!editing) throw new Error("Edição inválida");
        await updateSupplier(editing.id, payload as SupplierUpdate);
        toast.success("Fornecedor atualizado");
      }

      setOpen(false);
      setEditing(null);
      await reload();
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      if (msg.includes("DOCUMENT_ALREADY_EXISTS")) toast.error("Documento já cadastrado para esta empresa.");
      else toast.error(e?.message ?? "Falha ao salvar fornecedor");
    } finally {
      setSaving(false);
    }
  }

  return {
    rows, loading, saving,
    q, setQ,
    showInactive, setShowInactive,
    open, setOpen,
    mode, editing,
    reload, onCreate, onEdit, onRemove, onSubmit,
  };
}

function sanitizePayload(data: SupplierUpsertForm) {
  const toNull = (v: any) => (v === "" || typeof v === "undefined" ? null : v);

  return {
    ...data,
    document: onlyDigits(data.document),

    phone: toNull(onlyDigits(data.phone ?? "")),
    mobile: toNull(onlyDigits(data.mobile ?? "")),

    billing_zip_code: toNull(onlyDigits(data.billing_zip_code ?? "")),
    shipping_zip_code: toNull(onlyDigits(data.shipping_zip_code ?? "")),
    email: toNull(data.email),

    ie: toNull(data.ie),
    person_type: toNull(data.person_type),
    contact_name: toNull(data.contact_name),
    notes: toNull(data.notes),

    billing_address_line1: toNull(data.billing_address_line1),
    billing_address_line2: toNull(data.billing_address_line2),
    billing_district: toNull(data.billing_district),
    billing_city: toNull(data.billing_city),
    billing_state: toNull(data.billing_state),
    billing_country: toNull(data.billing_country),

    shipping_address_line1: toNull(data.shipping_address_line1),
    shipping_address_line2: toNull(data.shipping_address_line2),
    shipping_district: toNull(data.shipping_district),
    shipping_city: toNull(data.shipping_city),
    shipping_state: toNull(data.shipping_state),
    shipping_country: toNull(data.shipping_country),
  };
}
