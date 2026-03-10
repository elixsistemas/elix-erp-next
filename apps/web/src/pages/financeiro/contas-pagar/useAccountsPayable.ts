import { useCallback, useEffect, useMemo, useState } from "react";
import { listAccountsPayable } from "./accounts-payable.service";
import type { AccountsPayableRow, AccountsPayableStatus } from "./accounts-payable.types";

export function useAccountsPayable() {
  const [allRows, setAllRows] = useState<AccountsPayableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<AccountsPayableStatus | "">("");
  const [overdueOnly, setOverdueOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listAccountsPayable({
        q: q || undefined,
        status: status || undefined,
        overdueOnly,
      });
      setAllRows(rows);
    } finally {
      setLoading(false);
    }
  }, [q, status, overdueOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(() => allRows, [allRows]);

  const reload = useCallback(() => {
    void load();
  }, [load]);

  return {
    rows,
    loading,
    q,
    setQ,
    status,
    setStatus,
    overdueOnly,
    setOverdueOnly,
    reload,
  };
}