import { useCallback, useEffect, useState } from "react";
import { listPurchaseEntryImports } from "./purchase-entry-imports.service";
import type { PurchaseEntryImportRow, PurchaseEntryImportStatus } from "./purchase-entry-imports.types";

export function usePurchaseEntryImports() {
  const [rows, setRows] = useState<PurchaseEntryImportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<PurchaseEntryImportStatus | "">("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listPurchaseEntryImports({
        q: q || undefined,
        status: status || undefined,
      });
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  useEffect(() => {
    void load();
  }, [load]);

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
    reload,
  };
}