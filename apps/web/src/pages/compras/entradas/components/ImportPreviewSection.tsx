
import type { PurchaseEntryConfirmationPreview } from "../purchase-entry-imports.types";

type Props = {
  preview: PurchaseEntryConfirmationPreview | null;
  loading?: boolean;
  onRefresh: () => void;
};

function money(value: number | null | undefined) {
  if (value == null) return "—";

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function ImportPreviewSection({ preview, loading, onRefresh }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Preview da confirmação
        </h3>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {loading ? "Atualizando..." : "Atualizar preview"}
        </button>
      </div>

      {!preview ? (
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Nenhum preview carregado.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                <th className="px-3 py-2">Linha</th>
                <th className="px-3 py-2">Produto</th>
                <th className="px-3 py-2 text-right">Qtd.</th>
                <th className="px-3 py-2 text-right">Custo atual</th>
                <th className="px-3 py-2 text-right">Novo custo</th>
                <th className="px-3 py-2 text-right">Preço atual</th>
                <th className="px-3 py-2 text-right">Preço sugerido</th>
                <th className="px-3 py-2 text-right">Preço aplicado</th>
                <th className="px-3 py-2 text-right">Margem atual</th>
                <th className="px-3 py-2 text-right">Margem projetada</th>
                <th className="px-3 py-2 text-center">Mov. estoque</th>
              </tr>
            </thead>
            <tbody>
              {preview.items.map((item) => (
                <tr
                  key={item.importItemId}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="px-3 py-2">{item.lineNo}</td>
                  <td className="px-3 py-2">{item.productName ?? "—"}</td>
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  <td className="px-3 py-2 text-right">{money(item.previousCost)}</td>
                  <td className="px-3 py-2 text-right">{money(item.newCost)}</td>
                  <td className="px-3 py-2 text-right">{money(item.previousPrice)}</td>
                  <td className="px-3 py-2 text-right">{money(item.suggestedPrice)}</td>
                  <td className="px-3 py-2 text-right">{money(item.appliedPrice)}</td>
                  <td className="px-3 py-2 text-right">
                    {item.currentMarginPercent.toFixed(2)}%
                  </td>
                  <td className="px-3 py-2 text-right">
                    {item.projectedMarginPercent.toFixed(2)}%
                  </td>
                  <td className="px-3 py-2 text-center">
                    {item.movedToStock ? "Sim" : "Não"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}