import { useEffect, useState } from "react";
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
  const isLocked = data?.header.status === "CONFIRMED" || data?.header.status === "CANCELED";
  const canConfirm =
    !!data &&
    !!data.header.supplier_id &&
    data.items.every((x) => !!x.product_id);

  async function reloadAll() {
    await st.reload();
  }

  async function onUpdateFinancial(field: "chartAccountId" | "costCenterId" | "paymentTermId", value: string) {
    if (!data) return;
    setBusy(true);
    try {
      await updatePurchaseEntryFinancial(id, {
        chartAccountId:
          field === "chartAccountId"
            ? value ? Number(value) : null
            : data.header.chart_account_id,
        costCenterId:
          field === "costCenterId"
            ? value ? Number(value) : null
            : data.header.cost_center_id,
        paymentTermId:
          field === "paymentTermId"
            ? value ? Number(value) : null
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

  async function onUpdateItem(itemId: number, payload: { quantity?: number; unitPrice?: number; totalPrice?: number }) {
    setBusy(true);
    try {
      await updatePurchaseEntryItem(id, itemId, payload);
      await reloadAll();
    } finally {
      setBusy(false);
    }
  }

  async function onUpdateInstallment(installmentId: number, payload: { dueDate?: string; amount?: number }) {
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
    return <div className="text-sm text-muted-foreground">Carregando...</div>;
  }

  const { header, items, installments } = data;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Importação #{header.id}</h1>
          <p className="text-sm text-muted-foreground">{header.access_key}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass(header.status)}`}>
            {header.status}
          </span>

          <Button variant="outline" onClick={() => navigate("/compras/entradas")}>
            Voltar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border p-4 md:grid-cols-2 lg:grid-cols-4">
        <div><div className="text-xs text-muted-foreground">Fornecedor XML</div><div className="mt-1 font-medium">{header.supplier_name ?? "—"}</div></div>
        <div><div className="text-xs text-muted-foreground">Documento fornecedor</div><div className="mt-1 font-medium">{header.supplier_document ?? "—"}</div></div>
        <div><div className="text-xs text-muted-foreground">NF / Série</div><div className="mt-1 font-medium">{header.invoice_number ?? "—"} / {header.invoice_series ?? "—"}</div></div>
        <div><div className="text-xs text-muted-foreground">Emissão</div><div className="mt-1 font-medium">{header.issue_date ?? "—"}</div></div>
        <div><div className="text-xs text-muted-foreground">Fornecedor vinculado</div><div className="mt-1 font-medium">{header.supplier_id ?? "Pendente"}</div></div>
        <div><div className="text-xs text-muted-foreground">Produtos</div><div className="mt-1 font-medium">{money(header.products_amount)}</div></div>
        <div><div className="text-xs text-muted-foreground">Frete</div><div className="mt-1 font-medium">{money(header.freight_amount)}</div></div>
        <div><div className="text-xs text-muted-foreground">Total</div><div className="mt-1 font-medium">{money(header.total_amount)}</div></div>
      </div>

      <div className="rounded-xl border p-4 space-y-3">
        <div className="text-sm font-medium">Classificação financeira</div>

        <div className="grid gap-3 md:grid-cols-3">
          <select
            className="h-10 rounded-md border px-3"
            value={header.chart_account_id ?? ""}
            onChange={(e) => void onUpdateFinancial("chartAccountId", e.target.value)}
            disabled={busy || !!isLocked}
          >
            <option value="">Plano de contas</option>
            {financialOptions.chartAccounts.map((x) => (
              <option key={x.id} value={x.id}>
                {x.code ? `${x.code} - ` : ""}{x.name}
              </option>
            ))}
          </select>

          <select
            className="h-10 rounded-md border px-3"
            value={header.cost_center_id ?? ""}
            onChange={(e) => void onUpdateFinancial("costCenterId", e.target.value)}
            disabled={busy || !!isLocked}
          >
            <option value="">Centro de custo</option>
            {financialOptions.costCenters.map((x) => (
              <option key={x.id} value={x.id}>
                {x.code ? `${x.code} - ` : ""}{x.name}
              </option>
            ))}
          </select>

          <select
            className="h-10 rounded-md border px-3"
            value={header.payment_term_id ?? ""}
            onChange={(e) => void onUpdateFinancial("paymentTermId", e.target.value)}
            disabled={busy || !!isLocked}
          >
            <option value="">Condição de pagamento</option>
            {financialOptions.paymentTerms.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {installments.length > 0 && (
        <div className="rounded-xl border p-4 space-y-3">
          <div className="text-sm font-medium">Parcelas importadas</div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="px-3 py-2">Parcela</th>
                  <th className="px-3 py-2">Vencimento</th>
                  <th className="px-3 py-2">Valor</th>
                  <th className="px-3 py-2">Conta a pagar</th>
                </tr>
              </thead>
              <tbody>
                {installments.map((inst) => (
                  <tr key={inst.id} className="border-t">
                    <td className="px-3 py-2">{inst.installment_number ?? inst.line_no}</td>
                    <td className="px-3 py-2">
                      {isLocked ? (
                        inst.due_date
                      ) : (
                        <input
                          type="date"
                          className="h-9 rounded-md border px-2"
                          defaultValue={inst.due_date}
                          onBlur={(e) => {
                            if (e.target.value && e.target.value !== inst.due_date) {
                              void onUpdateInstallment(inst.id, { dueDate: e.target.value });
                            }
                          }}
                        />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isLocked ? (
                        money(inst.amount)
                      ) : (
                        <input
                          type="number"
                          step="0.01"
                          className="h-9 rounded-md border px-2"
                          defaultValue={Number(inst.amount)}
                          onBlur={(e) => {
                            const value = Number(e.target.value);
                            if (value > 0 && value !== Number(inst.amount)) {
                              void onUpdateInstallment(inst.id, { amount: value });
                            }
                          }}
                        />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {inst.accounts_payable_id ? `#${inst.accounts_payable_id}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-xl border p-4 space-y-3">
        <div className="text-sm font-medium">Fornecedor</div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            className="h-10 rounded-md border px-3 min-w-[320px]"
            value={header.supplier_id ?? ""}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value) void onMatchSupplier(value);
            }}
            disabled={busy || !!isLocked}
          >
            <option value="">Selecione o fornecedor</option>
            {st.suppliers.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>

          {!isLocked && (
            <Button
              type="button"
              variant="outline"
              onClick={onCreateSupplier}
              disabled={busy}
            >
              Criar fornecedor do XML
            </Button>
          )}

          {header.status === "CONFIRMED" && (
            <Button asChild variant="outline">
              <Link to="/financeiro/contas-pagar">Ver contas a pagar</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-4 py-3">Linha</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">EAN</th>
                <th className="px-4 py-3">NCM</th>
                <th className="px-4 py-3">Qtd.</th>
                <th className="px-4 py-3">Unit.</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Match</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3">{item.line_no}</td>
                  <td className="px-4 py-3">{item.description}</td>
                  <td className="px-4 py-3">{item.ean ?? "—"}</td>
                  <td className="px-4 py-3">{item.ncm ?? "—"}</td>
                  <td className="px-4 py-3">
                    {isLocked ? (
                      item.quantity
                    ) : (
                      <input
                        type="number"
                        step="0.0001"
                        className="h-9 rounded-md border px-2 w-24"
                        defaultValue={Number(item.quantity)}
                        onBlur={(e) => {
                          const value = Number(e.target.value);
                          if (value > 0 && value !== Number(item.quantity)) {
                            void onUpdateItem(item.id, { quantity: value });
                          }
                        }}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isLocked ? (
                      money(item.unit_price)
                    ) : (
                      <input
                        type="number"
                        step="0.000001"
                        className="h-9 rounded-md border px-2 w-28"
                        defaultValue={Number(item.unit_price)}
                        onBlur={(e) => {
                          const value = Number(e.target.value);
                          if (value >= 0 && value !== Number(item.unit_price)) {
                            void onUpdateItem(item.id, { unitPrice: value });
                          }
                        }}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">{money(item.total_price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        className="h-9 rounded-md border px-2 min-w-[260px]"
                        value={item.product_id ?? ""}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (value) void onMatchProduct(item.id, value);
                        }}
                        disabled={busy || !!isLocked}
                      >
                        <option value="">Selecione</option>
                        {st.products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} {p.sku ? `(${p.sku})` : ""}
                          </option>
                        ))}
                      </select>

                      {!isLocked && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void onCreateProduct(item.id)}
                          disabled={busy}
                        >
                          Criar produto
                        </Button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass(item.match_status)}`}>
                      {item.match_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!isLocked && (
          <>
            <Button
              onClick={onConfirm}
              disabled={busy || !canConfirm}
            >
              Confirmar entrada
            </Button>

            <Button
              variant="outline"
              onClick={onCancel}
              disabled={busy}
            >
              Cancelar importação
            </Button>
          </>
        )}

        {header.status === "CONFIRMED" && (
          <Button asChild variant="outline">
            <Link to="/inventory/movements">Ver movimentações de estoque</Link>
          </Button>
        )}
      </div>
    </div>
  );
}