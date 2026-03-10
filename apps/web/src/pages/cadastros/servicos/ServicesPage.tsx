import { ServicesToolbar } from "./components/ServicesToolbar";
import { ServicesTable } from "./components/ServicesTable";
import { ServiceSheet } from "./components/ServiceSheet";
import { useServices } from "./useServices";

export default function ServicesPage() {
  const vm = useServices();

  return (
    <div className="space-y-4">
      <ServicesToolbar
        q={vm.q}
        onChangeQ={vm.setQ}
        showInactive={vm.showInactive}
        onToggleInactive={vm.setShowInactive}
        loading={vm.loading}
        onCreate={vm.onCreate}
        onReload={vm.reload}
      />

      <ServicesTable
        rows={vm.rows}
        loading={vm.loading}
        onEdit={vm.onEdit}
        onRemove={vm.onRemove}
      />

      <ServiceSheet
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