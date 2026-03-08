import { useNavigate } from "react-router-dom";

import { CarrierSheet } from "./components/CarrierSheet";
import { CarriersTable } from "./components/CarriersTable";
import { CarriersToolbar } from "./components/CarriersToolbar";
import { useCarriers } from "./useCarriers";

export default function CarriersPage() {
  const vm = useCarriers();
  const navigate = useNavigate();

  function handleOpenVehicles(row: { id: number }) {
    navigate(`/cadastros/transportadoras/veiculos?carrierId=${row.id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Transportadoras</h1>
        <p className="text-sm text-muted-foreground">
          Cadastro completo para logística, frete e documentos fiscais.
        </p>
      </div>

      <CarriersToolbar
        q={vm.q}
        onChangeQ={vm.setQ}
        showInactive={vm.showInactive}
        onToggleInactive={vm.setShowInactive}
        loading={vm.loading}
        onReload={vm.reload}
        onCreate={vm.onCreate}
      />

      <CarriersTable
        rows={vm.rows}
        loading={vm.loading}
        onEdit={vm.onEdit}
        onRemove={vm.onRemove}
        onOpenVehicles={handleOpenVehicles}
      />

      <CarrierSheet
        open={vm.open}
        onOpenChange={vm.setOpen}
        mode={vm.mode}
        saving={vm.saving}
        initialData={vm.editing}
        onSubmit={vm.onSubmit}
      />
    </div>
  );
}