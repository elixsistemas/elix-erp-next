import { SupplierToolbar } from "./components/SuppliersToolbar";
import { SuppliersTable } from "./components/SuppliersTable";
import { SupplierSheet } from "./components/SuppliersSheet";
import { useSuppliers } from "./useSuppliers";

export default function SuppliersPage() {
  const vm = useSuppliers();

  return (
    <div className="p-6 space-y-4">
      <SupplierToolbar
        q={vm.q}
        onChangeQ={vm.setQ}
        showInactive={vm.showInactive}
        onToggleInactive={vm.setShowInactive}
        loading={vm.loading}
        onCreate={vm.onCreate}
        onReload={vm.reload}
      />

      <SuppliersTable
        rows={vm.rows}
        loading={vm.loading}
        onEdit={vm.onEdit}
        onRemove={vm.onRemove}
      />

      <SupplierSheet
        open={vm.open}
        mode={vm.mode}
        saving={vm.saving}
        initialData={vm.editing}
        onOpenChange={vm.setOpen}
        onSubmit={vm.onSubmit}
      />
    </div>
  );
}
