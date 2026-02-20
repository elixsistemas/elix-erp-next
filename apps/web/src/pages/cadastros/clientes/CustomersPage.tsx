import { CustomerSheet } from "./components/CustomerSheet";
import { CustomersTable } from "./components/CustomersTable";
import { CustomerToolbar } from "./components/CustomersToolbar";
import { useCustomers } from "./useCustomers";

export default function CustomersPage() {
  const vm = useCustomers();

  return (
    <div className="p-6 space-y-4">
      <CustomerToolbar
        q={vm.q}
        onChangeQ={vm.setQ}
        showInactive={vm.showInactive}
        onToggleInactive={vm.setShowInactive}
        loading={vm.loading}
        onCreate={vm.onCreate}
        onReload={vm.reload}
      />

      <CustomersTable
        rows={vm.rows}
        loading={vm.loading}
        onEdit={vm.onEdit}
        onRemove={vm.onRemove}
      />

      <CustomerSheet
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
