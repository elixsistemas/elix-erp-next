import { useCallback, useEffect, useState } from "react";
import { listPurchaseEntryImports } from "./purchase-entry-imports.service";
import type {
  PurchaseEntryImportRow,
  PurchaseEntryImportStatus,
} from "./purchase-entry-imports.types";

type UsePurchaseEntryImportsResult = {
  rows: PurchaseEntryImportRow[];
  loading: boolean;
  q: string;
  setQ: React.Dispatch<React.SetStateAction<string>>;
  status: "" | PurchaseEntryImportStatus;
  setStatus: React.Dispatch<React.SetStateAction<"" | PurchaseEntryImportStatus>>;
  reload: () => Promise<void>;
};

export function usePurchaseEntryImports(): UsePurchaseEntryImportsResult {
  const [rows, setRows] = useState<PurchaseEntryImportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | PurchaseEntryImportStatus>("");

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await listPurchaseEntryImports({
        q: q.trim() || undefined,
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

  const reload = useCallback(async () => {
    await load();
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