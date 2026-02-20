import * as React from "react";
import { toast } from "sonner";
import type { BankAccountRow, Company, CompanyUpdate } from "./company.types";
import { getMyCompany, listBankAccounts, updateMyCompany } from "./company.service";

export function useCompany() {
  const [company, setCompany] = React.useState<Company | null>(null);
  const [bankAccounts, setBankAccounts] = React.useState<BankAccountRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [open, setOpen] = React.useState(false);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const [c, banks] = await Promise.all([getMyCompany(), listBankAccounts()]);
      setCompany(c);
      setBankAccounts(banks ?? []);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao carregar empresa");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  async function save(patch: CompanyUpdate) {
    setSaving(true);
    try {
      const updated = await updateMyCompany(patch);
      setCompany(updated);
      toast.success("Empresa atualizada");
      setOpen(false);
    } catch (e: any) {
      // backend pode devolver BANK_ACCOUNT_INVALID etc.
      const msg = String(e?.message ?? "");
      if (msg.includes("BANK_ACCOUNT_INVALID")) toast.error("Conta bancária inválida para esta empresa.");
      else toast.error(e?.message ?? "Falha ao salvar empresa");
    } finally {
      setSaving(false);
    }
  }

  return {
    company,
    bankAccounts,
    loading,
    saving,
    open,
    setOpen,
    reload,
    save,
  };
}
