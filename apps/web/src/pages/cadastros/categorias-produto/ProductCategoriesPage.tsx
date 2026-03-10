import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type {
  ProductCategoryFormData,
  ProductCategoryNode,
} from "./product-categories.types";
import { useProductCategories } from "./useProductCategories";
import { ProductCategoryDialog } from "./components/ProductCategoryDialog";
import { ProductCategoriesToolbar } from "./components/ProductCategoriesToolbar";
import { ProductCategoriesTree } from "./components/ProductCategoriesTree";

type DialogState =
  | { open: false }
  | {
      open: true;
      title: string;
      currentId?: number | null;
      initialValues?: Partial<ProductCategoryFormData>;
    };

export default function ProductCategoriesPage() {
  const auth = useAuth() as {
    hasModule?: (value: string) => boolean;
    hasPermission?: (value: string) => boolean;
  };

  const canRead =
    auth.hasModule?.("cadastros.product_categories") !== false &&
    auth.hasPermission?.("product_categories.read") !== false;

  //const canCreate = auth.hasPermission?.("product_categories.create") !== false;
  const canUpdate = auth.hasPermission?.("product_categories.update") !== false;
  const canDelete = auth.hasPermission?.("product_categories.delete") !== false;

  const {
    items,
    filteredItems,
    loading,
    saving,
    error,
    search,
    setSearch,
    createItem,
    updateItem,
    deleteItem,
  } = useProductCategories();

  const [dialog, setDialog] = useState<DialogState>({ open: false });

  function closeDialog() {
    setDialog({ open: false });
  }

  function handleCreateRoot() {
    setDialog({
      open: true,
      title: "Nova categoria",
      initialValues: {
        parentId: null,
        code: "",
        name: "",
        active: true,
        sortOrder: 0,
      },
    });
  }

  function handleCreateChild(item: ProductCategoryNode) {
    setDialog({
      open: true,
      title: `Nova subcategoria de ${item.code}`,
      initialValues: {
        parentId: item.id,
        active: true,
        sortOrder: 0,
      },
    });
  }

  function handleEdit(item: ProductCategoryNode) {
    if (!canUpdate) return;

    setDialog({
      open: true,
      title: `Editar ${item.code}`,
      currentId: item.id,
      initialValues: {
        parentId: item.parent_id,
        code: item.code,
        name: item.name,
        active: item.active,
        sortOrder: item.sort_order,
      },
    });
  }

  async function handleSubmit(data: ProductCategoryFormData) {
    if (!dialog.open) return;

    if (dialog.currentId) {
      await updateItem(dialog.currentId, data);
    } else {
      await createItem(data);
    }

    closeDialog();
  }

  async function handleDelete(item: ProductCategoryNode) {
    if (!canDelete) return;

    const confirmed = window.confirm(
      `Excluir a categoria ${item.code} - ${item.name}?`,
    );
    if (!confirmed) return;

    await deleteItem(item.id);
  }

  if (!canRead) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Você não possui acesso ao módulo Categorias de Produto.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Categorias de Produto
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Estrutura hierárquica de classificação para produtos, filtros e relatórios.
        </p>
      </div>

      <ProductCategoriesToolbar
        search={search}
        onSearchChange={setSearch}
        onCreate={handleCreateRoot}
      />

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Carregando categorias...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
          {error}
        </div>
      )}

      {!loading && !error && filteredItems.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Nenhuma categoria encontrada.
        </div>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <ProductCategoriesTree
          items={filteredItems}
          onCreateChild={handleCreateChild}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <ProductCategoryDialog
        open={dialog.open}
        loading={saving}
        items={items}
        currentId={dialog.open ? dialog.currentId : null}
        initialValues={dialog.open ? dialog.initialValues : undefined}
        title={dialog.open ? dialog.title : "Categoria"}
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />
    </div>
  );
}