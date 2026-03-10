import { ProductKitsTable } from "./components/ProductKitsTable";
import { ProductKitsToolbar } from "./components/ProductKitsToolbar";
import { ProductKitSheet } from "./components/ProductKitSheet";
import { useProductKits } from "./useProductKits";

export default function ProductKitsPage() {
  const vm = useProductKits();

  return (
    <div className="space-y-4">
      <ProductKitsToolbar
        q={vm.q}
        onChangeQ={vm.setQ}
        onReload={vm.reload}
      />

      <ProductKitsTable
        rows={vm.rows}
        loading={vm.loading}
        onEdit={vm.onEdit}
      />

      <ProductKitSheet
        open={vm.open}
        onOpenChange={vm.setOpen}
        saving={vm.saving}
        initialData={vm.editing}
        onSubmit={vm.onSubmit}
      />
    </div>
  );
}