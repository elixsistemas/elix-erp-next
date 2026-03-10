import { useState } from "react";
import { useCostCenters } from "./useCostCenters";
import { CostCenterDialog } from "./components/CostCenterDialog";
import { CostCentersTable } from "./components/CostCentersTable";
import { CostCentersToolbar } from "./components/CostCentersToolbar";
import type { CostCenter, CostCenterFormData } from "./cost-centers.types";
import { useAuth } from "@/contexts/AuthContext";

export default function CostCentersPage() {
  const auth = useAuth() as {
    hasModule?: (value: string) => boolean;
    hasPermission?: (value: string) => boolean;
  };

  const canRead =
    auth.hasModule?.("finance.cost_centers") !== false &&
    auth.hasPermission?.("cost_centers.read") !== false;

  //const canCreate = auth.hasPermission?.("cost_centers.create") !== false;
  const canUpdate = auth.hasPermission?.("cost_centers.update") !== false;
  const canDelete = auth.hasPermission?.("cost_centers.delete") !== false;

  const {
    items,
    loading,
    saving,
    error,
    search,
    setSearch,
    activeFilter,
    setActiveFilter,
    activeItemsCount,
    createItem,
    updateItem,
    deleteItem,
  } = useCostCenters();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CostCenter | null>(null);

  function handleCreate() {
    setSelectedItem(null);
    setDialogOpen(true);
  }

  function handleEdit(item: CostCenter) {
    if (!canUpdate) return;
    setSelectedItem(item);
    setDialogOpen(true);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
    setSelectedItem(null);
  }

  async function handleSubmit(data: CostCenterFormData) {
    if (selectedItem) {
      await updateItem(selectedItem.id, data);
    } else {
      await createItem(data);
    }
    handleCloseDialog();
  }

  async function handleDelete(item: CostCenter) {
    if (!canDelete) return;

    const confirmed = window.confirm(
      `Excluir o centro de custo ${item.code} - ${item.name}?`,
    );
    if (!confirmed) return;

    await deleteItem(item.id);
  }

  if (!canRead) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Você não possui acesso ao módulo Centros de Custo.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Centros de Custo</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Estrutura analítica para classificação financeira por área da empresa.
        </p>
      </div>

      <CostCentersToolbar
        search={search}
        onSearchChange={setSearch}
        activeFilter={activeFilter}
        onActiveFilterChange={setActiveFilter}
        onCreate={handleCreate}
      />

      <div className="text-sm text-slate-500 dark:text-slate-400">
        {loading
          ? "Carregando..."
          : `${items.length} registro(s), ${activeItemsCount} ativo(s)`}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
          {error}
        </div>
      )}

      {!error && (
        <CostCentersTable
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <CostCenterDialog
        open={dialogOpen}
        loading={saving}
        item={selectedItem}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />
    </div>
  );
}