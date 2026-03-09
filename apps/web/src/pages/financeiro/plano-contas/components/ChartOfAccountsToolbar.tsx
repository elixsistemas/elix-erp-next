import { Plus, RefreshCw } from "lucide-react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onCreate: () => void;
  canCreate?: boolean;
};

export function ChartOfAccountsToolbar({
  search,
  onSearchChange,
  onRefresh,
  onCreate,
  canCreate = true,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar por código ou nome..."
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm md:max-w-md dark:border-slate-700 dark:bg-slate-950"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <RefreshCw size={16} />
          Atualizar
        </button>

        {canCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <Plus size={16} />
            Nova conta
          </button>
        )}
      </div>
    </div>
  );
}