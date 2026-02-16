// useBankAccounts.ts
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { BankAccount } from "./bank-accounts.types";
import {
  bankAccountFormSchema,
  normalizeBankAccountPayload,
  type BankAccountFormState,
} from "./bank-accounts.schemas";
import * as svc from "./bank-accounts.service";

const EMPTY_FORM: BankAccountFormState = {
  bankCode: "",
  name: "",
  agency: "",
  account: "",
  accountDigit: "",
  convenio: "",
  wallet: "",
  settingsJson: "",
};

export function useBankAccounts() {
  const [items, setItems] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<BankAccountFormState>(EMPTY_FORM);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) =>
      [
        x.name,
        x.bank_code,
        x.agency ?? "",
        x.account ?? "",
        x.account_digit ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [items, q]);

  async function load() {
    setLoading(true);
    try {
      const list = await svc.listBankAccounts();
      setItems(list);
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao carregar contas bancárias", {
        description: e?.message || "Verifique backend/token",
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(row: BankAccount) {
    setEditing(row);
    setForm({
      bankCode: row.bank_code ?? "",
      name: row.name ?? "",
      agency: row.agency ?? "",
      account: row.account ?? "",
      accountDigit: row.account_digit ?? "",
      convenio: row.convenio ?? "",
      wallet: row.wallet ?? "",
      settingsJson: row.settings_json ?? "",
    });
    setOpen(true);
  }

  async function save() {
    const parsed = bankAccountFormSchema.safeParse(form);
    if (!parsed.success) {
      toast.error("Revise o formulário", {
        description: parsed.error.issues?.[0]?.message ?? "Dados inválidos",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = normalizeBankAccountPayload(parsed.data);

      if (!editing) {
        await svc.createBankAccount(payload);
        toast.success("Conta bancária criada");
      } else {
        const { bankCode: _ignore, ...rest } = payload as any;
        await svc.updateBankAccount(editing.id, rest);
        toast.success("Conta bancária atualizada");
      }

      setOpen(false);
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao salvar", { description: e?.message || "Tente novamente" });
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(row: BankAccount) {
    try {
      await svc.deactivateBankAccount(row.id);
      toast.success("Conta desativada");
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao desativar", { description: e?.message || "Tente novamente" });
    }
  }

  return {
    // data
    items,
    filtered,
    loading,

    // search
    q,
    setQ,

    // dialog/form
    open,
    setOpen,
    editing,
    form,
    setForm,
    saving,

    // actions
    load,
    openCreate,
    openEdit,
    save,
    deactivate,
  };
}
