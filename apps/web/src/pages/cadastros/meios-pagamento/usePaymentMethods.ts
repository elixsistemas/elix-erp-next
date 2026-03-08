import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { PaymentMethod, PaymentMethodFormState } from "./payment-methods.types";
import {
  EMPTY_PAYMENT_METHOD_FORM,
  normalizePaymentMethodPayload,
  paymentMethodFormSchema,
} from "./payment-methods.schema";
import * as svc from "./payment-methods.service";

export function usePaymentMethods() {
  const [items, setItems] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"1" | "0" | "all">("1");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PaymentMethodFormState>(EMPTY_PAYMENT_METHOD_FORM);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;

    return items.filter((x) =>
      [
        x.code ?? "",
        x.name,
        x.type,
        x.description ?? "",
        x.integration_type ?? "",
        x.external_code ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [items, q]);

  async function load() {
    setLoading(true);
    try {
      const list = await svc.listPaymentMethods(statusFilter === "all" ? undefined : statusFilter);
      setItems(list);
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao carregar meios de pagamento", {
        description: e?.message || "Verifique backend/token",
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [statusFilter]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_PAYMENT_METHOD_FORM);
    setOpen(true);
  }

  function openEdit(row: PaymentMethod) {
    setEditing(row);
    setForm({
      code: row.code ?? "",
      name: row.name ?? "",
      type: row.type,
      description: row.description ?? "",
      active: !!row.active,

      allowsInstallments: !!row.allows_installments,
      maxInstallments: String(row.max_installments ?? 1),
      requiresBankAccount: !!row.requires_bank_account,
      settlementDays: String(row.settlement_days ?? 0),
      feePercent: String(row.fee_percent ?? 0),
      feeFixed: String(row.fee_fixed ?? 0),
      integrationType: row.integration_type ?? "none",
      externalCode: row.external_code ?? "",
      isDefault: !!row.is_default,
      sortOrder: String(row.sort_order ?? 0),
    });
    setOpen(true);
  }

  async function save() {
    const parsed = paymentMethodFormSchema.safeParse(form);

    if (!parsed.success) {
      toast.error("Revise o formulário", {
        description: parsed.error.issues?.[0]?.message ?? "Dados inválidos",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = normalizePaymentMethodPayload(parsed.data);

      if (!editing) {
        await svc.createPaymentMethod(payload);
        toast.success("Meio de pagamento criado");
      } else {
        await svc.updatePaymentMethod(editing.id, payload);
        toast.success("Meio de pagamento atualizado");
      }

      setOpen(false);
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao salvar", {
        description: e?.message || "Tente novamente",
      });
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(row: PaymentMethod) {
    try {
      await svc.deactivatePaymentMethod(row.id);
      toast.success("Meio de pagamento desativado");
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao desativar", {
        description: e?.message || "Tente novamente",
      });
    }
  }

  async function activate(row: PaymentMethod) {
    try {
      await svc.activatePaymentMethod(row.id);
      toast.success("Meio de pagamento ativado");
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao ativar", {
        description: e?.message || "Tente novamente",
      });
    }
  }

  return {
    items,
    filtered,
    loading,
    q,
    setQ,
    statusFilter,
    setStatusFilter,
    open,
    setOpen,
    editing,
    form,
    setForm,
    saving,
    load,
    openCreate,
    openEdit,
    save,
    deactivate,
    activate,
  };
}