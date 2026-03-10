import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Brand, BrandFormData } from "./brands.types";
import { useBrands } from "./useBrands";
import { BrandDialog } from "./components/BrandDialog";
import { BrandsTable } from "./components/BrandsTable";
import { BrandsToolbar } from "./components/BrandsToolbar";

export default function BrandsPage() {
  const auth = useAuth() as {
    hasModule?: (value: string) => boolean;
    hasPermission?: (value: string) => boolean;
  };

  const canRead =
    auth.hasModule?.("cadastros.brands") !== false &&
    auth.hasPermission?.("brands.read") !== false;

  //const canCreate = auth.hasPermission?.("brands.create") !== false;
  const canUpdate = auth.hasPermission?.("brands.update") !== false;
  const canDelete = auth.hasPermission?.("brands.delete") !== false;

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
  } = useBrands();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Brand | null>(null);

  function handleCreate() {
    setSelectedItem(null);
    setDialogOpen(true);
  }

  function handleEdit(item: Brand) {
    if (!canUpdate) return;
    setSelectedItem(item);
    setDialogOpen(true);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
    setSelectedItem(null);
  }

  async function handleSubmit(data: BrandFormData) {
    if (selectedItem) {
      await updateItem(selectedItem.id, data);
    } else {
      await createItem(data);
    }
    handleCloseDialog();
  }

  async function handleDelete(item: Brand) {
    if (!canDelete) return;

    const confirmed = window.confirm(
      `Excluir a marca ${item.code} - ${item.name}?`,
    );
    if (!confirmed) return;

    await deleteItem(item.id);
  }

  if (!canRead) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Você não possui acesso ao módulo Marcas.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marcas</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Cadastro de marcas para classificação comercial e analítica dos produtos.
        </p>
      </div>

      <BrandsToolbar
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
        <BrandsTable
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <BrandDialog
        open={dialogOpen}
        loading={saving}
        item={selectedItem}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />
    </div>
  );
}