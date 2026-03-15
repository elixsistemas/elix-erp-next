import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  cancelPurchaseEntryImport,
  confirmPurchaseEntryImport,
  createProductFromImportItem,
  createSupplierFromImport,
  getFinancialOptions,
  matchProduct,
  matchSupplier,
  previewPurchaseEntryConfirmation,
  updateImportInstallment,
  updateImportItem,
  updatePurchaseEntryEconomics,
  updatePurchaseEntryFinancial,
  updatePurchaseEntryItemAllocation,
  updatePurchaseEntryLogistics,
} from "./purchase-entry-imports.service";
import type {
  FinancialOptions,
  PurchaseEntryConfirmationPreview,
  PurchaseEntryImportDetails,
} from "./purchase-entry-imports.types";
import { usePurchaseEntryImport } from "./usePurchaseEntryImport";
import { ImportAlerts } from "./components/ImportAlerts";
import { ImportSummaryCards } from "./components/ImportSummaryCards";
import { ImportFinancialSection } from "./components/ImportFinancialSection";
import { ImportEconomicsSection } from "./components/ImportEconomicsSection";
import { ImportPreviewSection } from "./components/ImportPreviewSection";

type TabKey = "geral" | "parcelas" | "itens";

function money(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return String((error as { message: string }).message);
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Ocorreu um erro inesperado.";
}

function TabButton({
  active,
  children,
  onClick,
  badge,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  badge?: string | number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition",
        active
          ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
      ].join(" ")}
    >
      <span>{children}</span>
      {badge != null && (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function PurchaseEntryImportPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = Number(params.id);

  const st = usePurchaseEntryImport(id);
  const data = st.data as PurchaseEntryImportDetails | null;

  const [busy, setBusy] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<PurchaseEntryConfirmationPreview | null>(null);
  const [financialOptions, setFinancialOptions] = useState<FinancialOptions | null>(null);
  const [tab, setTab] = useState<TabKey>("geral");

  const [actionError, setActionError] = useState<string | null>(null);
  const [allocationError, setAllocationError] = useState<string | null>(null);
  const [installmentError, setInstallmentError] = useState<string | null>(null);
  const [economicsError, setEconomicsError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function reloadAll() {
    await st.reload();
  }

  function clearMessages() {
    setActionError(null);
    setAllocationError(null);
    setInstallmentError(null);
    setEconomicsError(null);
    setSuccessMessage(null);
  }

  async function loadPreview() {
    setPreviewLoading(true);
    try {
      const result = await previewPurchaseEntryConfirmation(id);
      setPreview(result);
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setPreviewLoading(false);
    }
  }

  useEffect(() => {
    void getFinancialOptions().then(setFinancialOptions);
  }, []);

  useEffect(() => {
    if (id) {
      void loadPreview();
    }
  }, [id]);

  const hasInvalidMarkup =
    data?.header.price_policy === "MARKUP" &&
    (data.header.markup_percent == null || Number(data.header.markup_percent) < 0);

  const hasInvalidMargin =
    data?.header.price_policy === "MARGIN" &&
    (
      data.header.margin_percent == null ||
      Number(data.header.margin_percent) <= 0 ||
      Number(data.header.margin_percent) >= 100
    );

  const canConfirm =
    !!data?.header.supplier_id &&
    (data?.items ?? []).every((item) => !!item.product_id) &&
    !hasInvalidMarkup &&
    !hasInvalidMargin;

  const isManualAllocation = data?.header.allocation_method === "MANUAL";

  const pendingItemsCount = useMemo(
    () => (data?.items ?? []).filter((item) => !item.product_id).length,
    [data],
  );

  async function onUpdateFinancial(
    field: "chartAccountId" | "costCenterId" | "paymentTermId",
    value: string,
  ) {
    clearMessages();
    setBusy(true);

    try {
      await updatePurchaseEntryFinancial(id, {
        chartAccountId: field === "chartAccountId" ? (value ? Number(value) : null) : undefined,
        costCenterId: field === "costCenterId" ? (value ? Number(value) : null) : undefined,
        paymentTermId: field === "paymentTermId" ? (value ? Number(value) : null) : undefined,
      });

      setSuccessMessage("Dados financeiros atualizados com sucesso.");
      await reloadAll();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onUpdateLogistics(
    field: "carrierId" | "carrierVehicleId" | "freightMode",
    value: string,
  ) {
    clearMessages();
    setBusy(true);

    try {
      await updatePurchaseEntryLogistics(id, {
        carrierId: field === "carrierId" ? (value ? Number(value) : null) : undefined,
        carrierVehicleId:
          field === "carrierVehicleId" ? (value ? Number(value) : null) : undefined,
        freightMode: field === "freightMode" ? (value || null) : undefined,
      });

      setSuccessMessage("Dados logísticos atualizados com sucesso.");
      await reloadAll();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onUpdateEconomics(
    field:
      | "allocationMethod"
      | "costPolicy"
      | "pricePolicy"
      | "markupPercent"
      | "marginPercent",
    value: string,
  ) {
    clearMessages();
    setBusy(true);

    try {
      await updatePurchaseEntryEconomics(id, {
        allocationMethod:
          field === "allocationMethod"
            ? (value as "VALUE" | "QUANTITY" | "WEIGHT" | "MANUAL")
            : undefined,
        costPolicy:
          field === "costPolicy"
            ? (value as "LAST_COST" | "AVERAGE_COST" | "LANDED_LAST_COST")
            : undefined,
        pricePolicy:
          field === "pricePolicy"
            ? (value as "NONE" | "MARKUP" | "MARGIN" | "SUGGESTED_ONLY")
            : undefined,
        markupPercent:
          field === "markupPercent" ? (value === "" ? null : Number(value)) : undefined,
        marginPercent:
          field === "marginPercent" ? (value === "" ? null : Number(value)) : undefined,
      });

      setSuccessMessage("Motor econômico atualizado com sucesso.");
      await reloadAll();
      await loadPreview();
    } catch (error) {
      setEconomicsError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onUpdateInstallment(
    installmentId: number,
    payload: {
      dueDate?: string;
      amount?: number;
    },
  ) {
    clearMessages();
    setBusy(true);

    try {
      await updateImportInstallment(id, installmentId, payload);
      setSuccessMessage("Parcela atualizada com sucesso.");
      await reloadAll();
    } catch (error) {
      setInstallmentError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onUpdateItem(
    itemId: number,
    payload: {
      quantity?: number;
      unitPrice?: number;
      totalPrice?: number;
    },
  ) {
    clearMessages();
    setBusy(true);

    try {
      await updateImportItem(id, itemId, payload);
      setSuccessMessage("Item atualizado com sucesso.");
      await reloadAll();
      await loadPreview();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onUpdateItemAllocation(
    itemId: number,
    field: "freightAllocated" | "insuranceAllocated" | "otherExpensesAllocated" | "discountAllocated",
    value: string,
  ) {
    clearMessages();
    setBusy(true);

    try {
      await updatePurchaseEntryItemAllocation(id, itemId, {
        [field]: value === "" ? 0 : Number(value),
      });
      setSuccessMessage("Rateio manual atualizado com sucesso.");
      await reloadAll();
      await loadPreview();
    } catch (error) {
      setAllocationError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onMatchSupplier(supplierId: number) {
    clearMessages();
    setBusy(true);

    try {
      await matchSupplier(id, supplierId);
      setSuccessMessage("Fornecedor vinculado com sucesso.");
      await reloadAll();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onCreateSupplier(payload?: { overwriteName?: string }) {
    clearMessages();
    setBusy(true);

    try {
      await createSupplierFromImport(id, payload ?? {});
      setSuccessMessage("Fornecedor criado com sucesso.");
      await reloadAll();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onMatchProduct(itemId: number, productId: number) {
    clearMessages();
    setBusy(true);

    try {
      await matchProduct(id, itemId, productId);
      setSuccessMessage("Produto vinculado com sucesso.");
      await reloadAll();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onCreateProduct(
    itemId: number,
    payload?: {
      overwriteName?: string;
      kind?: "product" | "service";
      trackInventory?: boolean;
    },
  ) {
    clearMessages();
    setBusy(true);

    try {
      await createProductFromImportItem(id, itemId, payload ?? {});
      setSuccessMessage("Produto criado com sucesso.");
      await reloadAll();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onConfirm() {
    clearMessages();
    setBusy(true);

    try {
      const result = await confirmPurchaseEntryImport(id);
      setSuccessMessage("Importação confirmada com sucesso.");
      await reloadAll();
      navigate(`/purchase-entries/${result.purchaseEntryId}`);
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onCancel() {
    clearMessages();
    setBusy(true);

    try {
      await cancelPurchaseEntryImport(id);
      setSuccessMessage("Importação cancelada com sucesso.");
      await reloadAll();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  if (st.loading) {
    return <div className="p-6 text-sm text-slate-500">Carregando importação...</div>;
  }

  if (st.error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {st.error}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6 text-sm text-slate-500">Importação não encontrada.</div>;
  }

  const h = data.header;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Importação XML #{h.id}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            NF {h.invoice_number ?? "—"} / Série {h.invoice_series ?? "—"} • Status {h.status}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadPreview()}
            disabled={busy || previewLoading}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            {previewLoading ? "Atualizando..." : "Atualizar preview"}
          </button>

          <button
            type="button"
            onClick={() => void onCancel()}
            disabled={busy || h.status === "CONFIRMED" || h.status === "CANCELED"}
            className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
          >
            Cancelar importação
          </button>

          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={busy || !canConfirm || h.status === "CONFIRMED" || h.status === "CANCELED"}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Confirmar importação
          </button>
        </div>
      </div>

      <ImportAlerts
        actionError={actionError}
        allocationError={allocationError}
        installmentError={installmentError}
        economicsError={economicsError}
        successMessage={successMessage}
      />

      <div className="flex flex-wrap gap-2">
        <TabButton active={tab === "geral"} onClick={() => setTab("geral")}>
          Geral
        </TabButton>

        <TabButton
          active={tab === "parcelas"}
          onClick={() => setTab("parcelas")}
          badge={data.installments.length}
        >
          Parcelas
        </TabButton>

        <TabButton
          active={tab === "itens"}
          onClick={() => setTab("itens")}
          badge={pendingItemsCount}
        >
          Itens
        </TabButton>
      </div>

      {tab === "geral" && (
        <div className="space-y-6">
          <ImportSummaryCards data={data} />

          {financialOptions && (
            <ImportFinancialSection
              data={data}
              financialOptions={financialOptions}
              busy={busy}
              onChange={(field, value) => {
                void onUpdateFinancial(field, value);
              }}
            />
          )}

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
              Fornecedor
            </h3>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Documento</div>
                <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                  {h.supplier_document ?? "—"}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Nome XML</div>
                <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                  {h.supplier_name ?? "—"}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">ID vinculado</div>
                <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                  {h.supplier_id ?? "Não vinculado"}
                </div>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    const value = window.prompt("Digite o ID do fornecedor para vincular:");
                    if (value) void onMatchSupplier(Number(value));
                  }}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Vincular fornecedor
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onCreateSupplier()}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Criar fornecedor
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
              Logística
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                  ID transportadora
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  value={h.carrier_id ?? ""}
                  disabled={busy}
                  onChange={(e) => {
                    void onUpdateLogistics("carrierId", e.target.value);
                  }}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                  ID veículo
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  value={h.carrier_vehicle_id ?? ""}
                  disabled={busy}
                  onChange={(e) => {
                    void onUpdateLogistics("carrierVehicleId", e.target.value);
                  }}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                  Modalidade de frete
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  value={h.freight_mode ?? ""}
                  disabled={busy}
                  onChange={(e) => {
                    void onUpdateLogistics("freightMode", e.target.value);
                  }}
                >
                  <option value="">Selecione</option>
                  <option value="CIF">CIF</option>
                  <option value="FOB">FOB</option>
                  <option value="THIRD_PARTY">Terceiro</option>
                  <option value="OWN">Próprio</option>
                  <option value="NO_FREIGHT">Sem frete</option>
                </select>
              </div>
            </div>
          </section>

          <ImportEconomicsSection
            data={data}
            busy={busy}
            onChange={(field, value) => {
              void onUpdateEconomics(field, value);
            }}
          />

          <ImportPreviewSection
            preview={preview}
            loading={previewLoading}
            onRefresh={() => {
              void loadPreview();
            }}
          />
        </div>
      )}

      {tab === "parcelas" && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Parcelas
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {data.installments.length} parcela(s)
            </span>
          </div>

          <div className="space-y-3">
            {data.installments.map((inst) => (
              <div
                key={inst.id}
                className="grid gap-3 rounded-lg border border-slate-200 p-3 md:grid-cols-4 dark:border-slate-800"
              >
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Parcela</div>
                  <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                    {inst.installment_number ?? inst.line_no}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                    Vencimento
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                    value={inst.due_date ?? ""}
                    disabled={busy}
                    onChange={(e) => {
                      void onUpdateInstallment(inst.id, {
                        dueDate: e.target.value || undefined,
                      });
                    }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                    Valor
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                    value={inst.amount}
                    disabled={busy}
                    onChange={(e) => {
                      void onUpdateInstallment(inst.id, {
                        amount: e.target.value === "" ? undefined : Number(e.target.value),
                      });
                    }}
                  />
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Contas a pagar
                  </div>
                  <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                    {inst.accounts_payable_id ?? "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "itens" && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Itens da importação
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {pendingItemsCount} pendente(s)
            </span>
          </div>

          <div className="space-y-4">
            {data.items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Linha {item.line_no} — {item.description}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      EAN: {item.ean ?? "—"} • NCM: {item.ncm ?? "—"} • CFOP: {item.cfop ?? "—"} •
                      UOM: {item.uom ?? "—"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        const value = window.prompt("Digite o ID do produto para vincular:");
                        if (value) void onMatchProduct(item.id, Number(value));
                      }}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      Vincular produto
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void onCreateProduct(item.id)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      Criar produto
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                  <div>
                    <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                      value={item.quantity}
                      disabled={busy}
                      onChange={(e) => {
                        void onUpdateItem(item.id, {
                          quantity: Number(e.target.value),
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                      Unitário
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                      value={item.unit_price}
                      disabled={busy}
                      onChange={(e) => {
                        void onUpdateItem(item.id, {
                          unitPrice: Number(e.target.value),
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                      Total
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                      value={item.total_price}
                      disabled={busy}
                      onChange={(e) => {
                        void onUpdateItem(item.id, {
                          totalPrice: Number(e.target.value),
                        });
                      }}
                    />
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Produto vinculado
                    </div>
                    <div className="mt-2 text-sm text-slate-900 dark:text-slate-100">
                      {item.product_id ?? "Não vinculado"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Match status
                    </div>
                    <div className="mt-2 text-sm text-slate-900 dark:text-slate-100">
                      {item.match_status}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Landed unit
                    </div>
                    <div className="mt-2 text-sm text-slate-900 dark:text-slate-100">
                      {money(item.landed_unit_cost)}
                    </div>
                  </div>
                </div>

                {isManualAllocation && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                        Frete rateado
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                        value={item.freight_allocated}
                        disabled={busy}
                        onChange={(e) => {
                          void onUpdateItemAllocation(item.id, "freightAllocated", e.target.value);
                        }}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                        Seguro rateado
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                        value={item.insurance_allocated}
                        disabled={busy}
                        onChange={(e) => {
                          void onUpdateItemAllocation(item.id, "insuranceAllocated", e.target.value);
                        }}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                        Outras despesas
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                        value={item.other_expenses_allocated}
                        disabled={busy}
                        onChange={(e) => {
                          void onUpdateItemAllocation(
                            item.id,
                            "otherExpensesAllocated",
                            e.target.value,
                          );
                        }}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                        Desconto rateado
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                        value={item.discount_allocated}
                        disabled={busy}
                        onChange={(e) => {
                          void onUpdateItemAllocation(item.id, "discountAllocated", e.target.value);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}