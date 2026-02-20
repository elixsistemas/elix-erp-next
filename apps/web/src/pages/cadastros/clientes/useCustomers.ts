import * as React from "react";
import { toast } from "sonner";
import type { Customer, CustomerCreate, CustomerUpdate } from "./customers.types";
import { createCustomer, deleteCustomer, listCustomers, updateCustomer } from "./customers.service";
import { CustomerUpsertSchema, type CustomerUpsertForm } from "./customers.schema";

type Mode = "create" | "edit";

export function useCustomers() {
  const [rows, setRows] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [q, setQ] = React.useState("");
  const [showInactive, setShowInactive] = React.useState(false);

  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("create");
  const [editing, setEditing] = React.useState<Customer | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listCustomers({
        q: q.trim() ? q.trim() : undefined,
        limit: 50,
        active: showInactive ? undefined : 1,
      });
      setRows(data);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao listar clientes");
    } finally {
      setLoading(false);
    }
  }, [q, showInactive]);

  // debounce de busca
  React.useEffect(() => {
    const t = setTimeout(() => {
      void reload();
    }, 350);
    return () => clearTimeout(t);
  }, [q, showInactive, reload]);

  function onCreate() {
    setMode("create");
    setEditing(null);
    setOpen(true);
  }

  function onEdit(row: Customer) {
    setMode("edit");
    setEditing(row);
    setOpen(true);
  }

  async function onRemove(row: Customer) {
    if (!confirm(`Desativar o cliente "${row.name}"?`)) return;

    try {
      await deleteCustomer(row.id);
      toast.success("Cliente desativado");
      await reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao desativar cliente");
    }
  }

  async function onSubmit(form: CustomerUpsertForm) {
    const parsed = CustomerUpsertSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues?.[0]?.message ?? "Validação falhou");
      return;
    }

    setSaving(true);
    try {
      const payload = sanitizePayload(parsed.data);

      if (mode === "create") {
        await createCustomer(payload as CustomerCreate);
        toast.success("Cliente criado");
      } else {
        if (!editing) throw new Error("Edição inválida");
        await updateCustomer(editing.id, payload as CustomerUpdate);
        toast.success("Cliente atualizado");
      }

      setOpen(false);
      setEditing(null);
      await reload();
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      if (msg.includes("DOCUMENT_ALREADY_EXISTS")) toast.error("Documento já cadastrado para esta empresa.");
      else toast.error(e?.message ?? "Falha ao salvar cliente");
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
    showInactive,
    setShowInactive,

    open,
    setOpen,
    mode,
    editing,

    reload,
    onCreate,
    onEdit,
    onRemove,
    onSubmit,
  };
}

function sanitizePayload(data: CustomerUpsertForm) {
  // normaliza campos vazios para null (bom p/ SQL e JSON)
  const toNull = (v: any) => (v === "" || typeof v === "undefined" ? null : v);

  return {
    ...data,
    email: toNull(data.email),
    phone: toNull(data.phone),
    mobile: toNull(data.mobile),
    ie: toNull(data.ie),
    person_type: toNull(data.person_type),
    contact_name: toNull(data.contact_name),
    notes: toNull(data.notes),

    billing_address_line1: toNull(data.billing_address_line1),
    billing_address_line2: toNull(data.billing_address_line2),
    billing_district: toNull(data.billing_district),
    billing_city: toNull(data.billing_city),
    billing_state: toNull(data.billing_state),
    billing_zip_code: toNull(data.billing_zip_code),
    billing_country: toNull(data.billing_country),

    shipping_address_line1: toNull(data.shipping_address_line1),
    shipping_address_line2: toNull(data.shipping_address_line2),
    shipping_district: toNull(data.shipping_district),
    shipping_city: toNull(data.shipping_city),
    shipping_state: toNull(data.shipping_state),
    shipping_zip_code: toNull(data.shipping_zip_code),
    shipping_country: toNull(data.shipping_country),
  };
}
