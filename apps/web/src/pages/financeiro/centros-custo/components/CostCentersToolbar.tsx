type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  activeFilter: "1" | "0" | "";
  onActiveFilterChange: (value: "1" | "0" | "") => void;
  onCreate: () => void;
};

export function CostCentersToolbar({
  search,
  onSearchChange,
  activeFilter,
  onActiveFilterChange,
  onCreate,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-1 flex-col gap-3 md:flex-row">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por código ou nome..."
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />

        <select
          value={activeFilter}
          onChange={(e) => onActiveFilterChange(e.target.value as "1" | "0" | "")}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          <option value="">Todos</option>
          <option value="1">Ativos</option>
          <option value="0">Inativos</option>
        </select>
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        Novo centro de custo
      </button>
    </div>
  );
}