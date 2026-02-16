import { useCompanies } from "./useCompanies";
import { CompaniesToolbar } from "./components/CompaniesToolbar";
import { CompaniesTable } from "./components/CompaniesTable";
import { CompaniesDialog } from "./components/CompaniesDialog";

export default function CompaniesPage() {
  const c = useCompanies();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Empresas</h1>

      <CompaniesToolbar q={c.q} onChangeQ={c.setQ} onCreate={c.openCreate} />

      <CompaniesTable
        rows={c.rows}
        loading={c.loading}
        onEdit={c.openEdit}
        onDelete={(row) => {
          const ok = window.confirm(`Excluir "${row.name}"?`);
          if (ok) c.remove(row);
        }}
      />

      <CompaniesDialog
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
