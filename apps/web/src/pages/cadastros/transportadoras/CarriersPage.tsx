import { CarrierSheet } from "./components/CarrierSheet";
import { CarriersTable } from "./components/CarriersTable";
import { CarriersToolbar } from "./components/CarriersToolbar";
import { useCarriers } from "./useCarriers";

export default function CarriersPage() {
  const vm = useCarriers();

  return (
    <div className="space-y-4">
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