import * as React from "react";
import type { InventoryStockRow, ProductMini } from "./inventory.types";
import { listStock, listProductsMini } from "./inventory.service";

export function useInventoryStock() {
  const [rows, setRows] = React.useState<InventoryStockRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState("");

  const [products, setProducts] = React.useState<ProductMini[]>([]);
  const productsMap = React.useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const [stock, prods] = await Promise.all([listStock(), listProductsMini()]);
      setRows(stock);
      setProducts(prods);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((r) => {
      const p = productsMap.get(r.product_id);
      const name = (p?.name ?? "").toLowerCase();
      const sku = (p?.sku ?? "").toLowerCase();
      return name.includes(term) || sku.includes(term) || String(r.product_id).includes(term);
    });
  }, [rows, q, productsMap]);

  return {
    rows: filtered,
    loading,
    q,
    setQ,
    productsMap,
    reload,
  };
}
