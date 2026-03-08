import { useSearchParams } from "react-router-dom";

import { CarrierVehicleSheet } from "./components/CarrierVehicleSheet";
import { CarrierVehiclesTable } from "./components/CarrierVehiclesTable";
import { CarrierVehiclesToolbar } from "./components/CarrierVehiclesToolbar";
import { useCarrierVehicles } from "./useCarrierVehicles";

export default function CarrierVehiclesPage() {
  const [searchParams] = useSearchParams();
  const carrierIdFromUrl = searchParams.get("carrierId") ?? "";

  const vm = useCarrierVehicles(carrierIdFromUrl);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Veículos de transportadoras
        </h1>
        <p className="text-sm text-muted-foreground">
          Cadastro operacional de veículos vinculados às transportadoras.
        </p>
      </div>

      <CarrierVehiclesToolbar
        q={vm.q}
        onChangeQ={vm.setQ}
        carrierIdFilter={vm.carrierIdFilter}
        onChangeCarrierIdFilter={vm.setCarrierIdFilter}
        carrierOptions={vm.carrierOptions}
        showInactive={vm.showInactive}
        onToggleInactive={vm.setShowInactive}
        loading={vm.loading}
        onReload={vm.reload}
        onCreate={vm.onCreate}
      />

      <CarrierVehiclesTable
        rows={vm.rows}
        loading={vm.loading}
        onEdit={vm.onEdit}
        onRemove={vm.onRemove}
      />

      <CarrierVehicleSheet
        open={vm.open}
        onOpenChange={vm.setOpen}
        mode={vm.mode}
        saving={vm.saving}
        initialData={vm.editing}
        carrierOptions={vm.carrierOptions}
        onSubmit={vm.onSubmit}
      />
    </div>
  );
}