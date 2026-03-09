import { useState } from "react";
import { useChartOfAccounts } from "./useChartOfAccounts";
import { ChartOfAccountsToolbar } from "./components/ChartOfAccountsToolbar";
import { ChartOfAccountsTree } from "./components/ChartOfAccountsTree";
import { ChartAccountSheet } from "./components/ChartAccountSheet";
import type { ChartAccountNode, ChartAccountPayload } from "./chart-of-accounts.types";
import { useAuth } from "@/contexts/AuthContext";

type SheetState =
  | { open: false }
  | {
      open: true;
      mode: "create" | "edit";
      title: string;
      currentId?: number | null;
      initialValues?: Partial<ChartAccountPayload>;
    };

export default function ChartOfAccountsPage() {
  const auth = useAuth() as {
    hasModule?: (value: string) => boolean;
    hasPermission?: (value: string) => boolean;
  };

  const canRead =
    auth.hasModule?.("finance.chart_of_accounts") !== false &&
    auth.hasPermission?.("finance.chart_of_accounts.read") !== false;

  const canCreate = auth.hasPermission?.("finance.chart_of_accounts.create") !== false;
  const canUpdate = auth.hasPermission?.("finance.chart_of_accounts.update") !== false;
  const canDelete = auth.hasPermission?.("finance.chart_of_accounts.delete") !== false;

  const {
    items,
    filteredItems,
    loading,
    saving,
    error,
    search,
    setSearch,
    load,
    createItem,
    updateItem,
    toggleStatus,
    removeItem,
  } = useChartOfAccounts();

  const [sheet, setSheet] = useState<SheetState>({ open: false });

  function closeSheet() {
    setSheet({ open: false });
  }

  function handleCreateRoot() {
    setSheet({
      open: true,
      mode: "create",
      title: "Nova conta contábil",
      initialValues: {
        parentId: null,
        active: true,
        allowPosting: true,
        isResultAccount: false,
        sortOrder: 0,
        accountKind: "analytic",
        nature: "asset",
      },
    });
  }

  function handleCreateChild(item: ChartAccountNode) {
    setSheet({
      open: true,
      mode: "create",
      title: `Nova subconta de ${item.code}`,
      initialValues: {
        parentId: item.id,
        active: true,
        allowPosting: true,
        isResultAccount: item.is_result_account,
        dreGroup: item.dre_group,
        sortOrder: 0,
        accountKind: "analytic",
        nature: item.nature,
      },
    });
  }

  function handleEdit(item: ChartAccountNode) {
    setSheet({
      open: true,
      mode: "edit",
      title: `Editar ${item.code}`,
      currentId: item.id,
      initialValues: {
        parentId: item.parent_id,
        code: item.code,
        name: item.name,
        nature: item.nature,
        accountKind: item.account_kind,
        allowPosting: item.allow_posting,
        isResultAccount: item.is_result_account,
        dreGroup: item.dre_group,
        active: item.active,
        sortOrder: item.sort_order,
      },
    });
  }

  async function handleSubmit(values: ChartAccountPayload) {
    if (!sheet.open) return;

    if (sheet.mode === "create") {
      await createItem(values);
    } else if (sheet.currentId) {
      await updateItem(sheet.currentId, values);
    }

    closeSheet();
  }

  async function handleToggleStatus(item: ChartAccountNode) {
    if (!canUpdate) return;

    const confirmed = window.confirm(
      `${item.active ? "Inativar" : "Ativar"} a conta ${item.code} - ${item.name}?`,
    );
    if (!confirmed) return;

    await toggleStatus(item.id, !item.active);
  }

  async function handleDelete(item: ChartAccountNode) {
    if (!canDelete) return;

    const confirmed = window.confirm(
      `Excluir a conta ${item.code} - ${item.name}? Essa ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    await removeItem(item.id);
  }

  if (!canRead) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Você não possui acesso ao módulo Plano de Contas.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Plano de Contas</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Estrutura hierárquica contábil para o financeiro e relatórios.
        </p>
      </div>

      <ChartOfAccountsToolbar
        search={search}
        onSearchChange={setSearch}
        onRefresh={() => void load()}
        onCreate={handleCreateRoot}
        canCreate={canCreate}
      />

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Carregando plano de contas...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
          {error}
        </div>
      )}

      {!loading && !error && filteredItems.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Nenhuma conta encontrada.
        </div>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <ChartOfAccountsTree
          items={filteredItems}
          onCreateChild={handleCreateChild}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      )}

      <ChartAccountSheet
        open={sheet.open}
        mode={sheet.open ? sheet.mode : "create"}
        title={sheet.open ? sheet.title : "Conta contábil"}
        items={items}
        currentId={sheet.open ? sheet.currentId : null}
        initialValues={sheet.open ? sheet.initialValues : undefined}
        loading={saving}
        onClose={closeSheet}
        onSubmit={handleSubmit}
      />
    </div>
  );
}