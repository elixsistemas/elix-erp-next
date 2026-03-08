import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { PaymentTerm, PaymentTermFormState } from "./payment-terms.types";
import {
  EMPTY_PAYMENT_TERM_FORM,
  normalizePaymentTermPayload,
  paymentTermFormSchema,
} from "./payment-terms.schema";
import * as svc from "./payment-terms.service";

export function usePaymentTerms() {
  const [items, setItems] = useState<PaymentTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"1" | "0" | "all">("1");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentTerm | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PaymentTermFormState>(EMPTY_PAYMENT_TERM_FORM);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;

    return items.filter((x) =>
      [
        x.code ?? "",
        x.name,
        x.description ?? "",
        x.term_type,
        x.offsets.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [items, q]);

  async function load() {
    setLoading(true);
    try {
      const list = await svc.listPaymentTerms(statusFilter === "all" ? undefined : statusFilter);
      setItems(list);
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao carregar condições de pagamento", {
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
    setForm(EMPTY_PAYMENT_TERM_FORM);
    setOpen(true);
  }

  function openEdit(row: PaymentTerm) {
    setEditing(row);
    setForm({
      code: row.code ?? "",
      name: row.name ?? "",
      description: row.description ?? "",
      offsets: row.offsets.join("/"),
      active: !!row.active,

      termType: row.term_type,
      graceDays: String(row.grace_days ?? 0),
      interestMode: row.interest_mode,
      interestValue: String(row.interest_value ?? 0),
      penaltyValue: String(row.penalty_value ?? 0),
      discountMode: row.discount_mode,
      discountValue: String(row.discount_value ?? 0),
      allowsEarlyPaymentDiscount: !!row.allows_early_payment_discount,
      isDefault: !!row.is_default,
      sortOrder: String(row.sort_order ?? 0),
    });
    setOpen(true);
  }

  async function save() {
    const parsed = paymentTermFormSchema.safeParse(form);

    if (!parsed.success) {
      toast.error("Revise o formulário", {
        description: parsed.error.issues?.[0]?.message ?? "Dados inválidos",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = normalizePaymentTermPayload(parsed.data);

      if (!editing) {
        await svc.createPaymentTerm(payload);
        toast.success("Condição de pagamento criada");
      } else {
        await svc.updatePaymentTerm(editing.id, payload);
        toast.success("Condição de pagamento atualizada");
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
  };
}