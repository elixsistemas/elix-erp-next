
import type {
  MiniOption,
  PurchaseEntryImportDetails,
} from "../purchase-entry-imports.types";

type FinancialOptions = {
  chartAccounts: MiniOption[];
  costCenters: MiniOption[];
  paymentTerms: MiniOption[];
};

type Props = {
  data: PurchaseEntryImportDetails;
  financialOptions: FinancialOptions;
  busy?: boolean;
  onChange: (
    field: "chartAccountId" | "costCenterId" | "paymentTermId",
    value: string,
  ) => void;
};

export function ImportFinancialSection({
  data,
  financialOptions,
  busy,
  onChange,
}: Props) {
  const h = data.header;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
        Financeiro
      </h3>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
            Conta contábil
          </label>
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={h.chart_account_id ?? ""}
            disabled={busy}
            onChange={(e) => onChange("chartAccountId", e.target.value)}
          >
            <option value="">Selecione</option>
            {financialOptions.chartAccounts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.code ? `${item.code} - ${item.name}` : item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
            Centro de custo
          </label>
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={h.cost_center_id ?? ""}
            disabled={busy}
            onChange={(e) => onChange("costCenterId", e.target.value)}
          >
            <option value="">Selecione</option>
            {financialOptions.costCenters.map((item) => (
              <option key={item.id} value={item.id}>
                {item.code ? `${item.code} - ${item.name}` : item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
            Condição de pagamento
          </label>
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={h.payment_term_id ?? ""}
            disabled={busy}
            onChange={(e) => onChange("paymentTermId", e.target.value)}
          >
            <option value="">Selecione</option>
            {financialOptions.paymentTerms.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}