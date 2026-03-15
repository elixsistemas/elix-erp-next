import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getPurchaseEntry } from "./purchase-entry-imports.service";
import type {
  ConfirmImportEconomicsRow,
  PurchaseEntryDetails,
} from "./purchase-entry-imports.types";

const CONFIRM_SUMMARY_STORAGE_KEY = "purchase-entry-confirm-summary";

function money(value: number | null | undefined) {
  if (value == null) return "—";

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function badgeClass(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "bg-blue-100 text-blue-700";
    case "POSTED":
      return "bg-emerald-100 text-emerald-700";
    case "CANCELED":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-muted text-foreground";
  }
}

function loadConfirmSummary(purchaseEntryId: number): ConfirmImportEconomicsRow[] {
  try {
    const raw = sessionStorage.getItem(
      `${CONFIRM_SUMMARY_STORAGE_KEY}:${purchaseEntryId}`,
    );

    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.economics) ? parsed.economics : [];
  } catch {
    return [];
  }
}

export default function PurchaseEntryPage() {
  const params = useParams();
  const id = Number(params.id);

  const [data, setData] = useState<PurchaseEntryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [economics, setEconomics] = useState<ConfirmImportEconomicsRow[]>([]);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const details = await getPurchaseEntry(id);
      setData(details);
      setEconomics(loadConfirmSummary(id));
    } catch (err: any) {
      setError(err?.message ?? "Erro ao carregar entrada definitiva.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id > 0) {
      void load();
    }
  }, [id]);

  const totals = useMemo(() => {
    if (!data) {
      return {
        items: 0,
        qty: 0,
        landedTotal: 0,
      };
    }

    return data.items.reduce(
      (acc, item) => {
        acc.items += 1;
        acc.qty += Number(item.quantity ?? 0);
        acc.landedTotal += Number(item.landed_total_cost ?? 0);
        return acc;
      },
      { items: 0, qty: 0, landedTotal: 0 },
    );
  }, [data]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded border p-4 text-sm text-muted-foreground">
        Entrada definitiva não encontrada.
      </div>
    );
  }

  const { header, items } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Entrada definitiva #{header.id}</h1>
          <p className="text-sm text-muted-foreground">
            Origem: {header.origin_type} · Importação #{header.source_import_id ?? "—"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded px-2 py-1 text-xs font-medium ${badgeClass(header.status)}`}>
            {header.status}
          </span>

          <Link to="/compras/entradas/entries">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Fornecedor</div>
          <div className="font-medium">{header.supplier_name ?? "—"}</div>
          <div className="text-xs text-muted-foreground">{header.supplier_document ?? "—"}</div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">NF / Série</div>
          <div className="font-medium">
            {header.invoice_number ?? "—"} / {header.invoice_series ?? "—"}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Emissão</div>
          <div className="font-medium">{header.issue_date ?? "—"}</div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Entrada</div>
          <div className="font-medium">{header.entry_date ?? "—"}</div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-6">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Itens</div>
          <div className="font-medium">{totals.items}</div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Qtd total</div>
          <div className="font-medium">{totals.qty}</div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Produtos</div>
          <div className="font-medium">{money(header.products_amount)}</div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Frete</div>
          <div className="font-medium">{money(header.freight_amount)}</div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Custo final</div>
          <div className="font-medium">{money(totals.landedTotal)}</div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Total documento</div>
          <div className="font-medium">{money(header.total_amount)}</div>
        </div>
      </section>

      <section className="rounded-lg border p-4 space-y-4">
        <h2 className="text-lg font-semibold">Políticas aplicadas</h2>

        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded border p-3 text-sm">
            <div className="text-muted-foreground">Rateio</div>
            <div className="font-medium">{header.allocation_method}</div>
          </div>

          <div className="rounded border p-3 text-sm">
            <div className="text-muted-foreground">Custo</div>
            <div className="font-medium">{header.cost_policy}</div>
          </div>

          <div className="rounded border p-3 text-sm">
            <div className="text-muted-foreground">Preço</div>
            <div className="font-medium">{header.price_policy}</div>
          </div>

          <div className="rounded border p-3 text-sm">
            <div className="text-muted-foreground">Markup %</div>
            <div className="font-medium">
              {header.markup_percent != null ? `${header.markup_percent}%` : "—"}
            </div>
          </div>

          <div className="rounded border p-3 text-sm">
            <div className="text-muted-foreground">Margem %</div>
            <div className="font-medium">
              {header.margin_percent != null ? `${header.margin_percent}%` : "—"}
            </div>
          </div>
        </div>
      </section>

      {economics.length > 0 && (
        <section className="rounded-lg border p-4 space-y-4">
          <h2 className="text-lg font-semibold">Resumo econômico da confirmação</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-2 py-2">Produto</th>
                  <th className="px-2 py-2">Qtd</th>
                  <th className="px-2 py-2">Custo final</th>
                  <th className="px-2 py-2">Custo anterior</th>
                  <th className="px-2 py-2">Novo custo</th>
                  <th className="px-2 py-2">Preço anterior</th>
                  <th className="px-2 py-2">Preço sugerido</th>
                  <th className="px-2 py-2">Preço aplicado</th>
                  <th className="px-2 py-2">Estoque</th>
                </tr>
              </thead>

              <tbody>
                {economics.map((row) => (
                  <tr key={row.purchaseEntryItemId} className="border-b">
                    <td className="px-2 py-2">#{row.productId}</td>
                    <td className="px-2 py-2">{row.quantity}</td>
                    <td className="px-2 py-2">{money(row.landedUnitCost)}</td>
                    <td className="px-2 py-2">{money(row.previousCost)}</td>
                    <td className="px-2 py-2">{money(row.newCost)}</td>
                    <td className="px-2 py-2">{money(row.previousPrice)}</td>
                    <td className="px-2 py-2">{money(row.suggestedPrice)}</td>
                    <td className="px-2 py-2">{money(row.appliedPrice)}</td>
                    <td className="px-2 py-2">
                      {row.movedToStock ? "Movimentado" : "Sem estoque"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="rounded-lg border p-4 space-y-4">
        <h2 className="text-lg font-semibold">Itens da entrada</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-2 py-2">Linha</th>
                <th className="px-2 py-2">Produto</th>
                <th className="px-2 py-2">Descrição</th>
                <th className="px-2 py-2">Qtd</th>
                <th className="px-2 py-2">Unit.</th>
                <th className="px-2 py-2">Frete</th>
                <th className="px-2 py-2">Seguro</th>
                <th className="px-2 py-2">Outras</th>
                <th className="px-2 py-2">Desc.</th>
                <th className="px-2 py-2">Custo unit.</th>
                <th className="px-2 py-2">Custo total</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="px-2 py-2">{item.line_no}</td>
                  <td className="px-2 py-2">
                    <div className="font-medium">{item.product_name ?? `#${item.product_id}`}</div>
                    <div className="text-xs text-muted-foreground">{item.sku ?? "—"}</div>
                  </td>
                  <td className="px-2 py-2">{item.description_snapshot}</td>
                  <td className="px-2 py-2">{item.quantity}</td>
                  <td className="px-2 py-2">{money(item.unit_price)}</td>
                  <td className="px-2 py-2">{money(item.freight_allocated)}</td>
                  <td className="px-2 py-2">{money(item.insurance_allocated)}</td>
                  <td className="px-2 py-2">{money(item.other_expenses_allocated)}</td>
                  <td className="px-2 py-2">{money(item.discount_allocated)}</td>
                  <td className="px-2 py-2">{money(item.landed_unit_cost)}</td>
                  <td className="px-2 py-2">{money(item.landed_total_cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}