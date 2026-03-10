import { ProductsToolbar } from "./components/ProductsToolbar";
import { ProductsTable } from "./components/ProductsTable";
import { ProductSheet } from "./components/ProductSheet";
import { useProducts } from "./useProducts";

export default function ProductsPage() {
  const vm = useProducts();

  return (
    <div className="space-y-4">
      <ProductsToolbar
        q={vm.q}
        onChangeQ={vm.setQ}
        showInactive={vm.showInactive}
        onToggleInactive={vm.setShowInactive}
        kind={vm.kind}
        onChangeKind={vm.setKind}
        loading={vm.loading}
        onCreate={vm.onCreate}
        onReload={vm.reload}
      />

      <ProductsTable
        rows={vm.rows}
        loading={vm.loading}
        onEdit={vm.onEdit}
        onRemove={vm.onRemove}
      />

      <ProductSheet
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