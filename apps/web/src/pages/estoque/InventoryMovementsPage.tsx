import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInventoryMovements } from "./useInventoryMovements";
import { MovementsToolbar } from "./components/MovementsToolbar";
import { MovementsTable } from "./components/MovementsTable";
import { MovementDialog } from "./components/MovementDialog";

export default function InventoryMovementsPage() {
  const nav = useNavigate();
  const m = useInventoryMovements();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Movimentações de Estoque</h1>
        <Button variant="secondary" onClick={() => nav("/inventory")}>
          Saldo atual
        </Button>
      </div>

      <MovementsToolbar
        products={m.products}
        productId={m.productId}
        onChangeProductId={m.setProductId}
        type={m.type}
        onChangeType={m.setType}
        onCreate={m.openCreate}
        onReload={m.reload}
      />

      <MovementsTable rows={m.rows} loading={m.loading} productsMap={m.productsMap} />

      <MovementDialog
        open={m.dialogOpen}
        saving={m.saving}
        products={m.products}
        presetType={m.presetType}
        onClose={() => m.setDialogOpen(false)}
        onSubmit={m.submit}
      />
    </div>
  );
}
