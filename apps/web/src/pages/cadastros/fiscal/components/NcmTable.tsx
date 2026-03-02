import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useFiscalNcm } from "../useFiscalNcm";
import * as api from "../fiscal.service";
import { NcmFormSchema } from "../fiscal.schema";

type ImportPreview = {
  file: File;       
  fileName: string;
  inserted: number;
  updated: number;
  itemsCount: number;
};

export function NcmTable() {
  const { data, loading, error, query, setQuery, paging, reload } = useFiscalNcm();
  const [editing, setEditing] = useState<any>(null);

  const items = useMemo(() => data?.items ?? [], [data]);

  // import CSV
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);

  async function onSave(form: any) {
    const parsed = NcmFormSchema.safeParse(form);
    if (!parsed.success) {
      alert(parsed.error.issues.map((i) => i.message).join("\n"));
      return;
    }
    if (editing?.id) await api.updateNcm(editing.id, parsed.data);
    else await api.createNcm(parsed.data as any);
    setEditing(null);
    await reload();
  }

  async function onToggle(id: number) {
    await api.toggleNcm(id);
    await reload();
  }

    async function handleImportFile(file: File) {
    setImporting(true);
    try {
        const res = await api.importNcmFile(file, true);

        setPreview({
        file,                       // 👈 GUARDA O ARQUIVO
        fileName: file.name,
        inserted: Number(res.inserted ?? 0),
        updated: Number(res.updated ?? 0),
        itemsCount: Number(res.itemsCount ?? 0),
        });
    } catch (e: any) {
        toast.error(e?.message ?? "Falha ao importar arquivo de NCM");
    } finally {
        setImporting(false);
    }
    }

    async function confirmImport() {
    if (!preview) return;

    setImporting(true);
    try {
        const res = await api.importNcmFile(preview.file, false);

        toast.success(`NCM importado: +${res.inserted} / ~${res.updated}`);
        setPreview(null);
        await reload();
    } catch (e: any) {
        toast.error(e?.message ?? "Falha ao executar import de NCM");
    } finally {
        setImporting(false);
    }
    }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex flex-col">
          <label className="text-sm">Busca</label>
          <input
            className="border rounded-md px-3 py-2"
            value={query.search ?? ""}
            onChange={(e) => setQuery((q) => ({ ...q, page: 1, search: e.target.value }))}
            placeholder="Código ou descrição…"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm">Status</label>
          <select
            className="border rounded-md px-3 py-2"
            value={query.active ?? "1"}
            onChange={(e) => setQuery((q) => ({ ...q, page: 1, active: e.target.value as any }))}
          >
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </select>
        </div>

        <button
          className="px-4 py-2 rounded-md bg-black text-white"
          onClick={() => setEditing({ code: "", description: "", ex: null, start_date: null, end_date: null, active: true })}
          disabled={importing}
        >
          Novo NCM
        </button>

        <button
        className="px-4 py-2 rounded-md border"
        onClick={() => fileRef.current?.click()}
        disabled={importing}
        title="Importar NCM via XLSX/XLS/CSV/JSON (com prévia dry-run)"
        >
        {importing ? "Importando..." : "Importar Arquivo"}
        </button>

        <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xls,application/vnd.ms-excel,.json,application/json"
        className="hidden"
        onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void handleImportFile(f);
        }}
        />
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="border rounded-md overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 w-[120px]">Código</th>
              <th className="text-left p-3">Descrição</th>
              <th className="text-left p-3 w-[100px]">EX</th>
              <th className="text-left p-3 w-[120px]">Ativo</th>
              <th className="text-right p-3 w-[180px]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3" colSpan={5}>
                  Carregando…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={5}>
                  Nada encontrado.
                </td>
              </tr>
            ) : (
              items.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="p-3 font-mono">{it.code}</td>
                  <td className="p-3">{it.description}</td>
                  <td className="p-3">{it.ex ?? "-"}</td>
                  <td className="p-3">{it.active ? "Sim" : "Não"}</td>
                  <td className="p-3 text-right space-x-2">
                    <button className="px-3 py-1 rounded-md border" onClick={() => setEditing(it)}>
                      Editar
                    </button>
                    <button className="px-3 py-1 rounded-md border" onClick={() => void onToggle(it.id)}>
                      {it.active ? "Inativar" : "Ativar"}
                    </button>
                  </td>
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
            onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}
          >
            Anterior
          </button>
          <span>Página {paging.page}</span>
          <button
            className="px-3 py-1 rounded-md border"
            disabled={paging.page * paging.pageSize >= paging.total}
            onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}
          >
            Próxima
          </button>
        </div>
      </div>

      {/* Modal import preview */}
      {preview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-xl rounded-lg p-4 space-y-3">
            <div className="font-semibold">Prévia do import (dry-run)</div>
            <div className="text-sm text-muted-foreground">
              Arquivo: <span className="font-mono">{preview.fileName}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="border rounded-md p-3">
                <div className="text-xs text-muted-foreground">Linhas</div>
                <div className="font-mono text-lg">{preview.itemsCount}</div>
              </div>
              <div className="border rounded-md p-3">
                <div className="text-xs text-muted-foreground">Inserir</div>
                <div className="font-mono text-lg">{preview.inserted}</div>
              </div>
              <div className="border rounded-md p-3">
                <div className="text-xs text-muted-foreground">Atualizar</div>
                <div className="font-mono text-lg">{preview.updated}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-md border"
                onClick={() => setPreview(null)}
                disabled={importing}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-md bg-black text-white"
                onClick={() => void confirmImport()}
                disabled={importing}
                title="Executar import de verdade"
              >
                {importing ? "Processando..." : "Confirmar import"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg p-4 space-y-3">
            <div className="font-semibold">{editing.id ? "Editar NCM" : "Novo NCM"}</div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Código</label>
                <input
                  className="border rounded-md px-3 py-2 w-full font-mono"
                  value={editing.code ?? ""}
                  onChange={(e) => setEditing((s: any) => ({ ...s, code: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm">EX</label>
                <input
                  className="border rounded-md px-3 py-2 w-full"
                  value={editing.ex ?? ""}
                  onChange={(e) => setEditing((s: any) => ({ ...s, ex: e.target.value || null }))}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm">Descrição</label>
                <input
                  className="border rounded-md px-3 py-2 w-full"
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing((s: any) => ({ ...s, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm">Início (YYYY-MM-DD)</label>
                <input
                  className="border rounded-md px-3 py-2 w-full"
                  value={editing.start_date ?? ""}
                  onChange={(e) => setEditing((s: any) => ({ ...s, start_date: e.target.value || null }))}
                />
              </div>
              <div>
                <label className="text-sm">Fim (YYYY-MM-DD)</label>
                <input
                  className="border rounded-md px-3 py-2 w-full"
                  value={editing.end_date ?? ""}
                  onChange={(e) => setEditing((s: any) => ({ ...s, end_date: e.target.value || null }))}
                />
              </div>
              <label className="flex items-center gap-2 col-span-2">
                <input
                  type="checkbox"
                  checked={!!editing.active}
                  onChange={(e) => setEditing((s: any) => ({ ...s, active: e.target.checked }))}
                />
                Ativo
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded-md border" onClick={() => setEditing(null)}>
                Cancelar
              </button>
              <button className="px-4 py-2 rounded-md bg-black text-white" onClick={() => void onSave(editing)}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}