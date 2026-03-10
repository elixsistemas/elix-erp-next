import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInventoryStock } from "./useInventoryStock";
import { InventoryToolbar } from "./components/InventoryToolbar";
import { StockTable } from "./components/StockTable";

export default function InventoryPage() {
  const navigate = useNavigate();
  const inv = useInventoryStock();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Estoque</h1>
          <p className="text-sm text-muted-foreground">
            Consulta de saldo atual por produto.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/inventory/movements")}
          >
            Movimentações
          </Button>
        </div>
      </div>

      <InventoryToolbar
        q={inv.q}
        onChangeQ={inv.setQ}
        onReload={inv.reload}
      />

      <StockTable
        rows={inv.rows}
        loading={inv.loading}
        productsMap={inv.productsMap}
      />
    </div>
  );
}