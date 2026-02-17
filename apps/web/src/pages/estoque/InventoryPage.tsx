import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInventoryStock } from "./useInventoryStock";
import { InventoryToolbar } from "./components/InventoryToolbar";
import { StockTable } from "./components/StockTable";

export default function InventoryPage() {
  const nav = useNavigate();
  const inv = useInventoryStock();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Estoque</h1>
        <Button variant="secondary" onClick={() => nav("/inventory/movements")}>
          Movimentações
        </Button>
      </div>

      <InventoryToolbar q={inv.q} onChangeQ={inv.setQ} onReload={inv.reload} />

      <StockTable rows={inv.rows} loading={inv.loading} productsMap={inv.productsMap} />
    </div>
  );
}
