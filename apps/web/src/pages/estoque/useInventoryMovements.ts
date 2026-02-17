import * as React from "react";
import type { InventoryMovementRow, MovementType, ProductMini } from "./inventory.types";
import { listMovements, createMovement, listProductsMini } from "./inventory.service";
import type { MovementFormValues } from "./inventory.schema";

export function useInventoryMovements() {
  const [rows, setRows] = React.useState<InventoryMovementRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [products, setProducts] = React.useState<ProductMini[]>([]);
  const productsMap = React.useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const [productId, setProductId] = React.useState<number | "ALL">("ALL");
  const [type, setType] = React.useState<MovementType | "ALL">("ALL");

  const [limit, setLimit] = React.useState(100);
  const [offset, setOffset] = React.useState(0);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [presetType, setPresetType] = React.useState<MovementType>("IN");

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const [movs, prods] = await Promise.all([
        listMovements({
          productId: productId === "ALL" ? undefined : productId,
          type: type === "ALL" ? undefined : type,
          limit,
          offset,
        }),
        listProductsMini(),
      ]);

      setRows(movs);
      setProducts(prods);
    } finally {
      setLoading(false);
    }
  }, [productId, type, limit, offset]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  async function submit(values: MovementFormValues) {
    setSaving(true);
    try {
      const res = await createMovement(values);

      if ((res as any)?.deduped) {
        alert("Ação já registrada (evitamos duplicidade).");
      }

      setDialogOpen(false);
      await reload();
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      if (msg.includes("409") || msg.toLowerCase().includes("insufficient stock")) {
        alert("Estoque insuficiente para essa saída.");
        return;
      }
      alert(msg);
      throw e;
    } finally {
      setSaving(false);
    }
  }

  function openCreate(t: MovementType) {
  setPresetType(t);
  setDialogOpen(true);
}

  return {
    rows,
    loading,
    saving,

    products,
    productsMap,

    productId,
    setProductId,
    type,
    setType,

    limit,
    setLimit,
    offset,
    setOffset,

    dialogOpen,
    setDialogOpen,

    submit,
    reload,

    presetType,
    openCreate,
  };
}
