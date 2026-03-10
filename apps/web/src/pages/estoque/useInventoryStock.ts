import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/shared/api/client";
import type { Product } from "@/pages/cadastros/produtos/products.types";

export type InventoryStockRow = {
  product_id: number;
  name: string;
  sku: string | null;
  kind: Product["kind"];
  uom: string | null;
  active: boolean;
  on_hand: number;
  last_movement_at: string | null;
};

export function useInventoryStock() {
  const [rows, setRows] = useState<InventoryStockRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await api("/inventory");
      setRows((data ?? []) as InventoryStockRow[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    const term = q.trim().toLowerCase();

    if (!term) return rows;

    return rows.filter((row) => {
      return (
        row.name.toLowerCase().includes(term) ||
        (row.sku ?? "").toLowerCase().includes(term)
      );
    });
  }, [rows, q]);

  const productsMap = useMemo(() => {
    const map = new Map<number, Product>();

    for (const row of rows) {
      map.set(row.product_id, {
        id: row.product_id,
        company_id: 0,
        name: row.name,
        sku: row.sku,
        kind: row.kind,
        description: null,
        uom: row.uom,
        uom_id: null,
        ncm: null,
        ncm_id: null,
        ean: null,
        cest: null,
        cest_id: null,
        fiscal_json: null,
        price: 0,
        cost: 0,
        track_inventory: true,
        active: row.active,
        image_url: null,
        weight_kg: null,
        width_cm: null,
        height_cm: null,
        length_cm: null,
        created_at: "",
        updated_at: null,
      });
    }

    return map;
  }, [rows]);

  const reload = useCallback(() => {
    void load();
  }, [load]);

  return {
    rows: filteredRows,
    loading,
    q,
    setQ,
    reload,
    productsMap,
  };
}