
import type { PurchaseEntryImportDetails } from "../purchase-entry-imports.types";

type Props = {
  data: PurchaseEntryImportDetails;
  busy?: boolean;
  onChange: (
    field:
      | "allocationMethod"
      | "costPolicy"
      | "pricePolicy"
      | "markupPercent"
      | "marginPercent",
    value: string,
  ) => void;
};

export function ImportEconomicsSection({ data, busy, onChange }: Props) {
  const h = data.header;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
        Motor econômico
      </h3>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div>
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
            Rateio
          </label>
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={h.allocation_method}
            disabled={busy}
            onChange={(e) => onChange("allocationMethod", e.target.value)}
          >
            <option value="VALUE">Por valor</option>
            <option value="QUANTITY">Por quantidade</option>
            <option value="WEIGHT">Por peso</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
            Política de custo
          </label>
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={h.cost_policy}
            disabled={busy}
            onChange={(e) => onChange("costPolicy", e.target.value)}
          >
            <option value="LAST_COST">Último custo</option>
            <option value="AVERAGE_COST">Custo médio</option>
            <option value="LANDED_LAST_COST">Último custo com landed</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
            Política de preço
          </label>
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={h.price_policy}
            disabled={busy}
            onChange={(e) => onChange("pricePolicy", e.target.value)}
          >
            <option value="NONE">Não alterar</option>
            <option value="MARKUP">Markup</option>
            <option value="MARGIN">Margem</option>
            <option value="SUGGESTED_ONLY">Só sugerir</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
            % Markup
          </label>
          <input
            type="number"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={h.markup_percent ?? ""}
            disabled={busy}
            onChange={(e) => onChange("markupPercent", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
            % Margem
          </label>
          <input
            type="number"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={h.margin_percent ?? ""}
            disabled={busy}
            onChange={(e) => onChange("marginPercent", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}