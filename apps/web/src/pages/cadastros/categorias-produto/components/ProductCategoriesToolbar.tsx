type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
};

export function ProductCategoriesToolbar({
  search,
  onSearchChange,
  onCreate,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar por código ou nome..."
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm md:max-w-md dark:border-slate-700 dark:bg-slate-950"
      />

      <button
        type="button"
        onClick={onCreate}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        Nova categoria
      </button>
    </div>
  );
}