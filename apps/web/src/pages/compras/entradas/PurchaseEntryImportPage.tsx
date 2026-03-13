import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  cancelPurchaseEntryImport,
  confirmPurchaseEntryImport,
  createProductFromImportItem,
  createSupplierFromImport,
  getPurchaseEntryFinancialOptions,
  matchPurchaseEntryProduct,
  matchPurchaseEntrySupplier,
  updatePurchaseEntryFinancial,
  updatePurchaseEntryInstallment,
  updatePurchaseEntryItem,
} from "./purchase-entry-imports.service";
import { usePurchaseEntryImport } from "./usePurchaseEntryImport";
import type { FinancialOptions } from "./purchase-entry-imports.types";

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function badgeClass(status: string) {
  switch (status) {
    case "MATCHED":
    case "READY":
      return "bg-emerald-100 text-emerald-700";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-700";
    case "REVIEW":
    case "MATCH_PENDING":
      return "bg-amber-100 text-amber-700";
    case "ERROR":
      return "bg-red-100 text-red-700";
    case "CANCELED":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-muted text-foreground";
  }
}

export default function PurchaseEntryImportPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = Number(params.id);

  const st = usePurchaseEntryImport(id);

  const [busy, setBusy] = useState(false);
  const [financialOptions, setFinancialOptions] = useState<FinancialOptions>({
    chartAccounts: [],
    costCenters: [],
    paymentTerms: [],
  });

  useEffect(() => {
    void getPurchaseEntryFinancialOptions().then(setFinancialOptions);
  }, []);

  const data = st.data;

  const isLocked =
    data?.header.status === "CONFIRMED" || data?.header.status === "CANCELED";

  const canConfirm = useMemo(() => {
    if (!data) return false;
    return !!data.header.supplier_id && data.items.every((x) => !!x.product_id);
  }, [data]);

  async function reloadAll() {
    await st.reload();
  }

  async function onUpdateFinancial(
    field: "chartAccountId" | "costCenterId" | "paymentTermId",
    value: string,
  ) {
    if (!data) return;

    setBusy(true);
    try {
      await updatePurchaseEntryFinancial(id, {
        chartAccountId:
          field === "chartAccountId"
            ? value
              ? Number(value)
              : null
            : data.header.chart_account_id,
        costCenterId:
          field === "costCenterId"
            ? value
              ? Number(value)
              : null
            : data.header.cost_center_id,
        paymentTermId:
          field === "paymentTermId"
            ? value
              ? Number(value)
              : null
            : data.header.payment_term_id,
      });

      await reloadAll();
    } finally {
      setBusy(false);
    }
  }

  async function onMatchSupplier(supplierId: number) {
    setBusy(true);
    try {
      await matchPurchaseEntrySupplier(id, supplierId);
      await reloadAll();
    } finally {
      setBusy(false);
    }
  }

  async function onCreateSupplier() {
    setBusy(true);
    try {
      await createSupplierFromImport(id);
      await reloadAll();
    } finally {
      setBusy(false);
    }
  }

  async function onMatchProduct(itemId: number, productId: number) {
    setBusy(true);
    try {
      await matchPurchaseEntryProduct(id, itemId, productId);
      await reloadAll();
    } finally {
      setBusy(false);
    }
  }

  async function onCreateProduct(itemId: number) {
    setBusy(true);
    try {
      await createProductFromImportItem(id, itemId, {
        kind: "product",
        trackInventory: true,
      });
      await reloadAll();
    } finally {
      setBusy(false);
    }
  }

  async function onUpdateItem(
    itemId: number,
    payload: { quantity?: number; unitPrice?: number; totalPrice?: number },
  ) {
    setBusy(true);
    try {
      await updatePurchaseEntryItem(id, itemId, payload);
      await reloadAll();
    } finally {
      setBusy(false);
    }
  }

  async function onUpdateInstallment(
    installmentId: number,
    payload: { dueDate?: string; amount?: number },
  ) {
    setBusy(true);
    try {
      await updatePurchaseEntryInstallment(id, installmentId, payload);
      await reloadAll();
    } finally {
      setBusy(false);
    }
  }

  async function onConfirm() {
    setBusy(true);
    try {
      await confirmPurchaseEntryImport(id);
      await reloadAll();
    } finally {
      setBusy(false);
    }
  }

  async function onCancel() {
    setBusy(true);
    try {
      await cancelPurchaseEntryImport(id);
      navigate("/compras/entradas");
    } finally {
      setBusy(false);
    }
  }

  if (st.loading || !data) {
    return <div>Carregando...</div>;
  }

  const { header, items, installments } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Importação #{header.id}</h1>
          <p className="text-sm text-muted-foreground">{header.access_key}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded px-2 py-1 text-xs font-medium ${badgeClass(header.status)}`}>
            {header.status}
          </span>

          <Button variant="outline" onClick={() => navigate("/compras/entradas")}>
            Voltar
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Fornecedor XML</div>
          <div className="font-medium">{header.supplier_name ?? "—"}</div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Documento fornecedor</div>
          <div className="font-medium">{header.supplier_document ?? "—"}</div>
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
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Fornecedor vinculado</div>
          <div className="font-medium">{header.supplier_id ?? "Pendente"}</div>
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
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="font-medium">{money(header.total_amount)}</div>
        </div>
      </section>

      <section className="rounded-lg border p-4 space-y-4">
        <h2 className="text-lg font-semibold">Classificação financeira</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm">
            <span>Plano de contas</span>
            <select
              className="w-full rounded border px-3 py-2"
              value={header.chart_account_id ?? ""}
              onChange={(e) => void onUpdateFinancial("chartAccountId", e.target.value)}
              disabled={busy || !!isLocked}
            >
              <option value="">Selecione</option>
              {financialOptions.chartAccounts.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.code ? `${x.code} - ` : ""}
                  {x.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span>Centro de custo</span>
            <select
              className="w-full rounded border px-3 py-2"
              value={header.cost_center_id ?? ""}
              onChange={(e) => void onUpdateFinancial("costCenterId", e.target.value)}
              disabled={busy || !!isLocked}
            >
              <option value="">Selecione</option>
              {financialOptions.costCenters.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.code ? `${x.code} - ` : ""}
                  {x.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span>Condição de pagamento</span>
            <select
              className="w-full rounded border px-3 py-2"
              value={header.payment_term_id ?? ""}
              onChange={(e) => void onUpdateFinancial("paymentTermId", e.target.value)}
              disabled={busy || !!isLocked}
            >
              <option value="">Selecione</option>
              {financialOptions.paymentTerms.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {installments.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Parcelas importadas</h3>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-2 py-2">Parcela</th>
                    <th className="px-2 py-2">Vencimento</th>
                    <th className="px-2 py-2">Valor</th>
                    <th className="px-2 py-2">Conta a pagar</th>
                  </tr>
                </thead>
                <tbody>
                  {installments.map((inst) => (
                    <tr key={inst.id} className="border-b">
                      <td className="px-2 py-2">{inst.installment_number ?? inst.line_no}</td>
                      <td className="px-2 py-2">
                        {isLocked ? (
                          inst.due_date
                        ) : (
                          <input
                            className="rounded border px-2 py-1"
                            type="date"
                            defaultValue={inst.due_date}
                            onBlur={(e) => {
                              if (e.target.value && e.target.value !== inst.due_date) {
                                void onUpdateInstallment(inst.id, { dueDate: e.target.value });
                              }
                            }}
                          />
                        )}
                      </td>
                      <td className="px-2 py-2">
                        {isLocked ? (
                          money(inst.amount)
                        ) : (
                          <input
                            className="rounded border px-2 py-1"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={inst.amount}
                            onBlur={(e) => {
                              const value = Number(e.target.value);
                              if (value > 0 && value !== Number(inst.amount)) {
                                void onUpdateInstallment(inst.id, { amount: value });
                              }
                            }}
                          />
                        )}
                      </td>
                      <td className="px-2 py-2">
                        {inst.accounts_payable_id ? `#${inst.accounts_payable_id}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-lg border p-4 space-y-4">
        <h2 className="text-lg font-semibold">Fornecedor</h2>

        <div className="flex flex-wrap items-end gap-3">
          <label className="space-y-2 text-sm">
            <span>Vincular fornecedor</span>
            <select
              className="min-w-[320px] rounded border px-3 py-2"
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value) void onMatchSupplier(value);
              }}
              disabled={busy || !!isLocked}
              defaultValue=""
            >
              <option value="">Selecione o fornecedor</option>
              {st.suppliers.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>

          {!isLocked && (
            <Button variant="outline" onClick={() => void onCreateSupplier()} disabled={busy}>
              Criar fornecedor do XML
            </Button>
          )}

          {header.status === "CONFIRMED" && (
            <Link className="text-sm underline" to="/financeiro/contas-a-pagar">
              Ver contas a pagar
            </Link>
          )}
        </div>
      </section>

      <section className="rounded-lg border p-4 space-y-4">
        <h2 className="text-lg font-semibold">Itens</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-2 py-2">Linha</th>
                <th className="px-2 py-2">Descrição</th>
                <th className="px-2 py-2">EAN</th>
                <th className="px-2 py-2">NCM</th>
                <th className="px-2 py-2">Qtd.</th>
                <th className="px-2 py-2">Unit.</th>
                <th className="px-2 py-2">Total</th>
                <th className="px-2 py-2">Produto</th>
                <th className="px-2 py-2">Match</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b align-top">
                  <td className="px-2 py-2">{item.line_no}</td>
                  <td className="px-2 py-2">{item.description}</td>
                  <td className="px-2 py-2">{item.ean ?? "—"}</td>
                  <td className="px-2 py-2">{item.ncm ?? "—"}</td>
                  <td className="px-2 py-2">
                    {isLocked ? (
                      item.quantity
                    ) : (
                      <input
                        className="w-24 rounded border px-2 py-1"
                        type="number"
                        step="0.0001"
                        min="0.0001"
                        defaultValue={item.quantity}
                        onBlur={(e) => {
                          const value = Number(e.target.value);
                          if (value > 0 && value !== Number(item.quantity)) {
                            void onUpdateItem(item.id, { quantity: value });
                          }
                        }}
                      />
                    )}
                  </td>
                  <td className="px-2 py-2">
                    {isLocked ? (
                      money(item.unit_price)
                    ) : (
                      <input
                        className="w-28 rounded border px-2 py-1"
                        type="number"
                        step="0.000001"
                        min="0"
                        defaultValue={item.unit_price}
                        onBlur={(e) => {
                          const value = Number(e.target.value);
                          if (value >= 0 && value !== Number(item.unit_price)) {
                            void onUpdateItem(item.id, { unitPrice: value });
                          }
                        }}
                      />
                    )}
                  </td>
                  <td className="px-2 py-2">{money(item.total_price)}</td>
                  <td className="px-2 py-2">
                    <select
                      className="min-w-[220px] rounded border px-2 py-1"
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value) void onMatchProduct(item.id, value);
                      }}
                      disabled={busy || !!isLocked}
                      defaultValue=""
                    >
                      <option value="">Selecione</option>
                      {st.products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.sku ? `(${p.sku})` : ""}
                        </option>
                      ))}
                    </select>

                    {!isLocked && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void onCreateProduct(item.id)}
                          disabled={busy}
                        >
                          Criar produto
                        </Button>
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <span className={`rounded px-2 py-1 text-xs ${badgeClass(item.match_status)}`}>
                      {item.match_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        {!isLocked && (
          <>
            <Button onClick={() => void onConfirm()} disabled={busy || !canConfirm}>
              Confirmar entrada
            </Button>

            <Button variant="destructive" onClick={() => void onCancel()} disabled={busy}>
              Cancelar importação
            </Button>
          </>
        )}

        {header.status === "CONFIRMED" && (
          <Link className="text-sm underline" to="/estoque/movimentacoes">
            Ver movimentações de estoque
          </Link>
        )}
      </div>
    </div>
  );
}