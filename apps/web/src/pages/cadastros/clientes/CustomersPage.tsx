import { useCustomers } from "./useCustomers";
import { CustomerToolbar } from "./components/CustomersToolbar";
import { CustomerTable } from "./components/CustomersTable";
import { CustomersDialog } from "./components/CustomersDialog";

export default function CompaniesPage() {
  const c = useCustomers();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Empresas</h1>

      <CustomerToolbar q={c.q} onChangeQ={c.setQ} onCreate={c.openCreate} />

      <CustomerTable
        rows={c.rows}
        loading={c.loading}
        onEdit={c.openEdit}
        onDelete={(row) => {
          const ok = window.confirm(`Excluir "${row.name}"?`);
          if (ok) c.remove(row);
        }}
      />

      <CustomersDialog
        open={c.dialogOpen}
        mode={c.mode}
        initial={c.editing}
        saving={c.saving}
        onClose={() => c.setDialogOpen(false)}
        onSubmit={c.submit}
      />
    </div>
  );
}
