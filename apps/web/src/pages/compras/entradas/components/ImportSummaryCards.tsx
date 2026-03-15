
import type { PurchaseEntryImportDetails } from "../purchase-entry-imports.types";

type Props = {
  data: PurchaseEntryImportDetails;
};

function money(value: number | null | undefined) {
  if (value == null) return "—";

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
export function ImportSummaryCards({ data }: Props) {
  const h = data.header;

  const cards = [
    { label: "Produtos", value: money(Number(h.products_amount ?? 0)) },
    { label: "Frete", value: money(Number(h.freight_amount ?? 0)) },
    { label: "Seguro", value: money(Number(h.insurance_amount ?? 0)) },
    { label: "Outras despesas", value: money(Number(h.other_expenses_amount ?? 0)) },
    { label: "Desconto", value: money(Number(h.discount_amount ?? 0)) },
    { label: "Total", value: money(Number(h.total_amount ?? 0)) },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="text-xs uppercase tracking-wide text-slate-500">
            {card.label}
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}