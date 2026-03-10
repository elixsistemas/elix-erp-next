import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProductMini, InventoryStockRow } from "./inventory.types";
import { listStock } from "./inventory.service";

export function useInventoryStock() {
  const [allRows, setAllRows] = useState<InventoryStockRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listStock();
      setAllRows(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();

    if (!term) return allRows;

    return allRows.filter((row) => {
      return (
        row.name.toLowerCase().includes(term) ||
        (row.sku ?? "").toLowerCase().includes(term)
      );
    });
  }, [allRows, q]);

  const productsMap = useMemo(() => {
    const map = new Map<number, ProductMini>();

    for (const row of allRows) {
      map.set(row.product_id, {
        id: row.product_id,
        name: row.name,
        sku: row.sku,
      });
    }

    return map;
  }, [allRows]);

  const reload = useCallback(() => {
    void load();
  }, [load]);

  return {
    rows,
    loading,
    q,
    setQ,
    reload,
    productsMap,
  };
}