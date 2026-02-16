import { useProducts } from "./useProducts";
import { ProductsToolbar } from "./components/ProductsToolbar";
import { ProductsTable } from "./components/ProductsTable";
import { ProductsDialog } from "./components/ProductsDialog";

export default function ProductsPage() {
  const p = useProducts();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Produtos</h1>

      <ProductsToolbar q={p.q} onChangeQ={p.setQ} onCreate={p.openCreate} />

      <ProductsTable
        rows={p.rows}
        loading={p.loading}
        onEdit={p.openEdit}
        onDelete={(row) => {
          const ok = window.confirm(`Excluir "${row.name}"?`);
          if (ok) p.remove(row);
        }}
      />

      <ProductsDialog
        open={p.dialogOpen}
        mode={p.mode}
        initial={p.editing}
        saving={p.saving}
        onClose={() => p.setDialogOpen(false)}
        onSubmit={p.submit}
      />
    </div>
  );
}
