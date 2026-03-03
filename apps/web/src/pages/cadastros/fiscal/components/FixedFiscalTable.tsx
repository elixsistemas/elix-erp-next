import { useMemo } from "react";

type Props = {
  title: string;
  hook: {
    data: any;
    loading: boolean;
    error: string | null;
    query: any;
    setQuery: any;
    paging: { page: number; pageSize: number; total: number };
  };
};

export function FixedFiscalTable({ title, hook }: Props) {
  const { data, loading, error, query, setQuery, paging } = hook;
  const items = useMemo(() => data?.items ?? [], [data]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex flex-col">
          <label className="text-sm">Busca</label>
          <input
            className="border rounded-md px-3 py-2"
            value={query.search ?? ""}
            onChange={(e) => setQuery((q: any) => ({ ...q, page: 1, search: e.target.value }))}
            placeholder="Código ou descrição…"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm">Status</label>
          <select
            className="border rounded-md px-3 py-2"
            value={query.active ?? "1"}
            onChange={(e) => setQuery((q: any) => ({ ...q, page: 1, active: e.target.value }))}
          >
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </select>
        </div>

        <div className="ml-auto text-sm text-muted-foreground">{title}</div>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="border rounded-md overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 w-[140px]">Código</th>
              <th className="text-left p-3">Descrição</th>
              <th className="text-left p-3 w-[90px]">Ativo</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan={3}>Carregando…</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-3" colSpan={3}>Nada encontrado.</td></tr>
            ) : (
              items.map((it: any) => (
                <tr key={it.id} className="border-t">
                  <td className="p-3 font-mono">{it.code}</td>
                  <td className="p-3">{it.description}</td>
                  <td className="p-3">{it.active ? "Sim" : "Não"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div>Total: {paging.total}</div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 rounded-md border"
            disabled={paging.page <= 1}
            onClick={() => setQuery((q: any) => ({ ...q, page: (q.page ?? 1) - 1 }))}
          >
            Anterior
          </button>
          <span>Página {paging.page}</span>
          <button
            className="px-3 py-1 rounded-md border"
            disabled={paging.page * paging.pageSize >= paging.total}
            onClick={() => setQuery((q: any) => ({ ...q, page: (q.page ?? 1) + 1 }))}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}