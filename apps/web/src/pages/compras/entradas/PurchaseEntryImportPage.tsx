import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    cancelPurchaseEntryImport,
    confirmPurchaseEntryImport,
    createProductFromImportItem,
    createSupplierFromImport,
    getFinancialOptions,
    matchProduct,
    matchSupplier,
    updateImportInstallment,
    updateImportItem,
    updatePurchaseEntryFinancial,
    updatePurchaseEntryLogistics,
    previewPurchaseEntryConfirmation,
    updatePurchaseEntryEconomics,
    updatePurchaseEntryItemAllocation,
} from "./purchase-entry-imports.service";
import { usePurchaseEntryImport } from "./usePurchaseEntryImport";
import type { PurchaseEntryConfirmationPreview, FinancialOptions } from "./purchase-entry-imports.types";

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

const CONFIRM_SUMMARY_STORAGE_KEY = "purchase-entry-confirm-summary";

function saveConfirmSummary(
    purchaseEntryId: number,
    economics?: Array<{
        purchaseEntryItemId: number;
        productId: number;
        quantity: number;
        landedUnitCost: number;
        previousCost: number;
        newCost: number;
        previousPrice: number;
        suggestedPrice: number;
        appliedPrice: number;
        priceChanged: boolean;
        movedToStock: boolean;
    }>,
) {
    try {
        sessionStorage.setItem(
            `${CONFIRM_SUMMARY_STORAGE_KEY}:${purchaseEntryId}`,
            JSON.stringify({
                createdAt: new Date().toISOString(),
                economics: economics ?? [],
            }),
        );
    } catch {
        // ignora storage indisponível
    }
}

export default function PurchaseEntryImportPage() {
    const params = useParams();
    const navigate = useNavigate();
    const id = Number(params.id);

    const st = usePurchaseEntryImport(id);

    const [preview, setPreview] = useState<PurchaseEntryConfirmationPreview | null>(null);

    const [busy, setBusy] = useState(false);
    const [financialOptions, setFinancialOptions] = useState<FinancialOptions>({
        chartAccounts: [],
        costCenters: [],
        paymentTerms: [],
    });

    useEffect(() => {
        void getFinancialOptions().then(setFinancialOptions);
    }, []);

    useEffect(() => {
        void getFinancialOptions().then(setFinancialOptions);
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

    async function onUpdateItemAllocation(
        itemId: number,
        field:
            | "freightAllocated"
            | "insuranceAllocated"
            | "otherExpensesAllocated"
            | "discountAllocated",
        value: string,
    ) {
        setBusy(true);
        try {
            await updatePurchaseEntryItemAllocation(id, itemId, {
                [field]: value === "" ? 0 : Number(value),
            });

            await reloadAll();
            await loadPreview();
        } finally {
            setBusy(false);
        }
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

    async function loadPreview() {
        setBusy(true);
        try {
            const data = await previewPurchaseEntryConfirmation(id);
            setPreview(data);
        } finally {
            setBusy(false);
        }
    }

    async function onUpdateLogistics(
        field: "carrierId" | "carrierVehicleId" | "freightMode",
        value: string,
    ) {
        if (!data) return;

        setBusy(true);
        try {
            await updatePurchaseEntryLogistics(id, {
                carrierId:
                    field === "carrierId"
                        ? value
                            ? Number(value)
                            : null
                        : data.header.carrier_id,
                carrierVehicleId:
                    field === "carrierVehicleId"
                        ? value
                            ? Number(value)
                            : null
                        : data.header.carrier_vehicle_id,
                freightMode:
                    field === "freightMode"
                        ? value || null
                        : data.header.freight_mode,
            });

            await reloadAll();
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
        if (!data) return;

        setBusy(true);
        try {
            await updatePurchaseEntryEconomics(id, {
                allocationMethod:
                    field === "allocationMethod"
                        ? (value as any)
                        : data.header.allocation_method,
                costPolicy:
                    field === "costPolicy"
                        ? (value as any)
                        : data.header.cost_policy,
                pricePolicy:
                    field === "pricePolicy"
                        ? (value as any)
                        : data.header.price_policy,
                markupPercent:
                    field === "markupPercent"
                        ? value === ""
                            ? null
                            : Number(value)
                        : data.header.markup_percent,
                marginPercent:
                    field === "marginPercent"
                        ? value === ""
                            ? null
                            : Number(value)
                        : data.header.margin_percent,
            });

            await reloadAll();
            await loadPreview();
        } finally {
            setBusy(false);
        }
    }

    async function onMatchSupplier(supplierId: number) {
        setBusy(true);
        try {
            await matchSupplier(id, supplierId);
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
            await matchProduct(id, itemId, productId);
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
            await updateImportItem(id, itemId, payload);
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
            await updateImportInstallment(id, installmentId, payload);
            await reloadAll();
        } finally {
            setBusy(false);
        }
    }

    async function onConfirm() {
        setBusy(true);
        try {
            const result = await confirmPurchaseEntryImport(id);

            if (result?.purchaseEntryId) {
                saveConfirmSummary(result.purchaseEntryId, result.economics);
                navigate(`/compras/entradas/entry/${result.purchaseEntryId}`);
                return;
            }

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

    if (st.loading) {
        return <div>Carregando...</div>;
    }

    if (st.error) {
        return (
            <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                {st.error}
            </div>
        );
    }

    if (!data) {
        return (
            <div className="rounded border p-4 text-sm text-muted-foreground">
                Importação não encontrada ou ID inválido.
            </div>
        );
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

            <section className="grid gap-4 md:grid-cols-6">
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
                    <div className="text-sm text-muted-foreground">Seguro</div>
                    <div className="font-medium">{money(header.insurance_amount)}</div>
                </div>

                <div className="rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground">Outras despesas</div>
                    <div className="font-medium">{money(header.other_expenses_amount)}</div>
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
            </section>

            <section className="rounded-lg border p-4 space-y-4">
                <h2 className="text-lg font-semibold">Logística</h2>

                <div className="grid gap-4 md:grid-cols-3">
                    <label className="space-y-2 text-sm">
                        <span>Transportadora (ID)</span>
                        <input
                            className="w-full rounded border px-3 py-2"
                            defaultValue={header.carrier_id ?? ""}
                            disabled={busy || !!isLocked}
                            onBlur={(e) => void onUpdateLogistics("carrierId", e.target.value)}
                        />
                    </label>

                    <label className="space-y-2 text-sm">
                        <span>Veículo (ID)</span>
                        <input
                            className="w-full rounded border px-3 py-2"
                            defaultValue={header.carrier_vehicle_id ?? ""}
                            disabled={busy || !!isLocked}
                            onBlur={(e) => void onUpdateLogistics("carrierVehicleId", e.target.value)}
                        />
                    </label>

                    <label className="space-y-2 text-sm">
                        <span>Modalidade de frete</span>
                        <input
                            className="w-full rounded border px-3 py-2"
                            defaultValue={header.freight_mode ?? ""}
                            disabled={busy || !!isLocked}
                            onBlur={(e) => void onUpdateLogistics("freightMode", e.target.value)}
                        />
                    </label>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded border p-3 text-sm">
                        <div className="text-muted-foreground">Transportadora XML</div>
                        <div className="font-medium">{header.carrier_name_xml ?? "—"}</div>
                    </div>

                    <div className="rounded border p-3 text-sm">
                        <div className="text-muted-foreground">Documento XML</div>
                        <div className="font-medium">{header.carrier_document_xml ?? "—"}</div>
                    </div>

                    <div className="rounded border p-3 text-sm">
                        <div className="text-muted-foreground">IE XML</div>
                        <div className="font-medium">{header.carrier_ie_xml ?? "—"}</div>
                    </div>
                </div>
            </section>

            {installments.length > 0 && (
                <section className="rounded-lg border p-4 space-y-4">
                    <h2 className="text-lg font-semibold">Parcelas importadas</h2>

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
                </section>
            )}

            <section className="rounded-lg border p-4 space-y-4">
                <h2 className="text-lg font-semibold">Fornecedor</h2>

                <div className="flex flex-wrap items-end gap-3">
                    <label className="space-y-2 text-sm">
                        <span>Vincular fornecedor</span>
                        <select
                            className="min-w-[320px] rounded border px-3 py-2"
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
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold">Motor econômico</h2>
                        <p className="text-sm text-muted-foreground">
                            Rateio, custo, preço e impacto no estoque antes da confirmação
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => void loadPreview()}
                        disabled={busy || !!isLocked}
                    >
                        Atualizar preview
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-5">
                    <label className="space-y-2 text-sm">
                        <span>Rateio</span>
                        <select
                            className="w-full rounded border px-3 py-2"
                            value={header.allocation_method}
                            onChange={(e) => void onUpdateEconomics("allocationMethod", e.target.value)}
                            disabled={busy || !!isLocked}
                        >
                            <option value="VALUE">Por valor</option>
                            <option value="QUANTITY">Por quantidade</option>
                            <option value="WEIGHT">Por peso</option>
                            <option value="MANUAL">Manual</option>
                        </select>
                    </label>

                    <label className="space-y-2 text-sm">
                        <span>Política de custo</span>
                        <select
                            className="w-full rounded border px-3 py-2"
                            value={header.cost_policy}
                            onChange={(e) => void onUpdateEconomics("costPolicy", e.target.value)}
                            disabled={busy || !!isLocked}
                        >
                            <option value="LANDED_LAST_COST">Landed / último custo</option>
                            <option value="LAST_COST">Último custo</option>
                            <option value="AVERAGE_COST">Custo médio</option>
                        </select>
                    </label>

                    <label className="space-y-2 text-sm">
                        <span>Política de preço</span>
                        <select
                            className="w-full rounded border px-3 py-2"
                            value={header.price_policy}
                            onChange={(e) => void onUpdateEconomics("pricePolicy", e.target.value)}
                            disabled={busy || !!isLocked}
                        >
                            <option value="NONE">Não alterar preço</option>
                            <option value="MARKUP">Markup</option>
                            <option value="MARGIN">Margem</option>
                            <option value="SUGGESTED_ONLY">Somente sugerido</option>
                        </select>
                    </label>

                    <label className="space-y-2 text-sm">
                        <span>Markup %</span>
                        <input
                            className="w-full rounded border px-3 py-2"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={header.markup_percent ?? ""}
                            onBlur={(e) => void onUpdateEconomics("markupPercent", e.target.value)}
                            disabled={busy || !!isLocked || header.price_policy !== "MARKUP"}
                        />
                    </label>

                    <label className="space-y-2 text-sm">
                        <span>Margem %</span>
                        <input
                            className="w-full rounded border px-3 py-2"
                            type="number"
                            step="0.01"
                            min="0"
                            max="99.99"
                            defaultValue={header.margin_percent ?? ""}
                            onBlur={(e) => void onUpdateEconomics("marginPercent", e.target.value)}
                            disabled={busy || !!isLocked || header.price_policy !== "MARGIN"}
                        />
                    </label>
                </div>

                {header.price_policy === "MARKUP" && header.markup_percent == null && (
                    <p className="text-xs text-amber-700">
                        Informe o markup % antes de confirmar a entrada.
                    </p>
                )}

                {header.price_policy === "MARGIN" && header.margin_percent == null && (
                    <p className="text-xs text-amber-700">
                        Informe a margem % antes de confirmar a entrada.
                    </p>
                )}
            </section>
            {preview && (
                <section className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold">Resumo pré-confirmação</h2>
                            <p className="text-sm text-muted-foreground">
                                Impacto esperado em custo, preço e estoque antes de confirmar
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-6">
                        <div className="rounded border p-3 text-sm">
                            <div className="text-muted-foreground">Produtos</div>
                            <div className="font-medium">{money(preview.header.productsAmount)}</div>
                        </div>

                        <div className="rounded border p-3 text-sm">
                            <div className="text-muted-foreground">Frete</div>
                            <div className="font-medium">{money(preview.header.freightAmount)}</div>
                        </div>

                        <div className="rounded border p-3 text-sm">
                            <div className="text-muted-foreground">Seguro</div>
                            <div className="font-medium">{money(preview.header.insuranceAmount)}</div>
                        </div>

                        <div className="rounded border p-3 text-sm">
                            <div className="text-muted-foreground">Outras</div>
                            <div className="font-medium">{money(preview.header.otherExpensesAmount)}</div>
                        </div>

                        <div className="rounded border p-3 text-sm">
                            <div className="text-muted-foreground">Desconto</div>
                            <div className="font-medium">{money(preview.header.discountAmount)}</div>
                        </div>

                        <div className="rounded border p-3 text-sm">
                            <div className="text-muted-foreground">Total</div>
                            <div className="font-medium">{money(preview.header.totalAmount)}</div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="px-2 py-2">Linha</th>
                                    <th className="px-2 py-2">Produto</th>
                                    <th className="px-2 py-2">Custo anterior</th>
                                    <th className="px-2 py-2">Novo custo</th>
                                    <th className="px-2 py-2">Preço atual</th>
                                    <th className="px-2 py-2">Preço sugerido</th>
                                    <th className="px-2 py-2">Preço aplicado</th>
                                    <th className="px-2 py-2">Estoque</th>
                                </tr>
                            </thead>

                            <tbody>
                                {preview.items.map((item) => (
                                    <tr key={item.importItemId} className="border-b">
                                        <td className="px-2 py-2">{item.lineNo}</td>
                                        <td className="px-2 py-2">{item.productName ?? `#${item.productId ?? "—"}`}</td>
                                        <td className="px-2 py-2">{money(item.previousCost)}</td>
                                        <td className="px-2 py-2">{money(item.newCost)}</td>
                                        <td className="px-2 py-2">{money(item.previousPrice)}</td>
                                        <td className="px-2 py-2">
                                            {item.suggestedPrice != null ? money(item.suggestedPrice) : "—"}
                                        </td>
                                        <td className="px-2 py-2">{money(item.appliedPrice)}</td>
                                        <td className="px-2 py-2">
                                            {item.movedToStock ? "Movimenta" : "Sem estoque"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
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
                                <th className="px-2 py-2">Frete</th>
                                <th className="px-2 py-2">Seguro</th>
                                <th className="px-2 py-2">Outras</th>
                                <th className="px-2 py-2">Desc.</th>
                                <th className="px-2 py-2">Custo final</th>
                                <th className="px-2 py-2">Produto</th>
                                <th className="px-2 py-2">Match</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr
                                    key={item.id}
                                    className={`border-b align-top ${item.match_status === "REVIEW" ? "bg-amber-50/50" : ""
                                        }`}
                                >
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
                                        {header.allocation_method === "MANUAL" && !isLocked ? (
                                            <input
                                                className="w-24 rounded border px-2 py-1"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                defaultValue={item.freight_allocated ?? 0}
                                                onBlur={(e) =>
                                                    void onUpdateItemAllocation(
                                                        item.id,
                                                        "freightAllocated",
                                                        e.target.value,
                                                    )
                                                }
                                                disabled={busy}
                                            />
                                        ) : (
                                            money(item.freight_allocated)
                                        )}
                                    </td>

                                    <td className="px-2 py-2">
                                        {header.allocation_method === "MANUAL" && !isLocked ? (
                                            <input
                                                className="w-24 rounded border px-2 py-1"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                defaultValue={item.insurance_allocated ?? 0}
                                                onBlur={(e) =>
                                                    void onUpdateItemAllocation(
                                                        item.id,
                                                        "insuranceAllocated",
                                                        e.target.value,
                                                    )
                                                }
                                                disabled={busy}
                                            />
                                        ) : (
                                            money(item.insurance_allocated)
                                        )}
                                    </td>

                                    <td className="px-2 py-2">
                                        {header.allocation_method === "MANUAL" && !isLocked ? (
                                            <input
                                                className="w-24 rounded border px-2 py-1"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                defaultValue={item.other_expenses_allocated ?? 0}
                                                onBlur={(e) =>
                                                    void onUpdateItemAllocation(
                                                        item.id,
                                                        "otherExpensesAllocated",
                                                        e.target.value,
                                                    )
                                                }
                                                disabled={busy}
                                            />
                                        ) : (
                                            money(item.other_expenses_allocated)
                                        )}
                                    </td>

                                    <td className="px-2 py-2">
                                        {header.allocation_method === "MANUAL" && !isLocked ? (
                                            <input
                                                className="w-24 rounded border px-2 py-1"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                defaultValue={item.discount_allocated ?? 0}
                                                onBlur={(e) =>
                                                    void onUpdateItemAllocation(
                                                        item.id,
                                                        "discountAllocated",
                                                        e.target.value,
                                                    )
                                                }
                                                disabled={busy}
                                            />
                                        ) : (
                                            money(item.discount_allocated)
                                        )}
                                    </td>

                                    <td className="px-2 py-2">{money(item.landed_total_cost)}</td>

                                    <td className="px-2 py-2">
                                        <select
                                            className="min-w-[220px] rounded border px-2 py-1"
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
                                        <div className="space-y-1">
                                            <span className={`rounded px-2 py-1 text-xs ${badgeClass(item.match_status)}`}>
                                                {item.match_status}
                                            </span>

                                            {item.match_notes && (
                                                <div className="text-xs text-muted-foreground">
                                                    {item.match_notes}
                                                </div>
                                            )}
                                        </div>
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
                    <>
                        <Link className="text-sm underline" to="/inventory/movements">
                            Ver movimentações de estoque
                        </Link>

                        {header.accounts_payable_id && (
                            <Link className="text-sm underline" to="/financeiro/contas-pagar">
                                Ver contas a pagar
                            </Link>
                        )}

                        {header.definitive_purchase_entry_id && (
                            <Link
                                className="text-sm underline"
                                to={`/compras/entradas/entry/${header.definitive_purchase_entry_id}`}
                            >
                                Abrir entrada definitiva #{header.definitive_purchase_entry_id}
                            </Link>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}