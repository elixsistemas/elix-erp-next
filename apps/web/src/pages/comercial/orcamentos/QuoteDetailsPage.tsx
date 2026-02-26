// src/pages/comercial/orcamentos/QuoteDetailsPage.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { DocumentPrintLayout } from "../_shared/DocumentPrintLayout";
import type { DocumentPrintData } from "../_shared/DocumentPrintLayout";
import type {
  QuoteRow, QuoteItemRow,
  QuoteCreate,
  CustomerMini, ProductMini,
} from "./quotes.types";
import { useCompany }        from "./useCompany";
import { useCustomer }       from "./useCustomer";
import type { CompanyData }  from "./useCompany";
import type { CustomerData } from "./useCustomer";

// ─── tipos internos ───────────────────────────────────────────────────────────
type QuoteDetails = QuoteRow & { items: QuoteItemRow[] };

type EditorItem = {
  _key:        string;   // chave local (não vai para API)
  productId:   number;
  description: string;
  unit:        string;
  quantity:    number;
  unitPrice:   number;
};

export type QuoteDetailsEditorProps = {
  mode:    "create" | "edit";
  initial: QuoteDetails | null;
  onSave:  (payload: QuoteCreate) => Promise<void>;
};

// ─── helpers ──────────────────────────────────────────────────────────────────
const BASE = "http://localhost:3333";
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` });

function calcTotals(items: EditorItem[], discount: number, freight: number) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const total    = Math.max(0, subtotal - discount + freight);
  return { subtotal, total };
}

// linha ~85 – substituir
const fmtBRL = (v: number | null | undefined): string =>
  (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });


// ═══════════════════════════════════════════════════════════════════════════════
// EDITOR (formulário criar/editar)
// ═══════════════════════════════════════════════════════════════════════════════
export function QuoteDetailsEditor({ mode, initial, onSave }: QuoteDetailsEditorProps) {
  const navigate = useNavigate();

  // ── estado do formulário ──────────────────────────────────────────────────
  const [customerId,       setCustomerId]       = React.useState<number | null>(initial?.customer_id ?? null);
  const [customerSearch,   setCustomerSearch]   = React.useState("");
  const [customers,        setCustomers]        = React.useState<CustomerMini[]>([]);
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerMini | null>(null);

  const [items,    setItems]    = React.useState<EditorItem[]>(() =>
    (initial?.items ?? []).map((it) => ({
      _key:        crypto.randomUUID(),
      productId:   it.product_id,
      description: it.description,
      unit:        it.unit ?? "UN",
      quantity:    it.quantity,
      unitPrice:   it.unit_price,
    }))
  );

  const [productSearch, setProductSearch] = React.useState("");
  const [products,      setProducts]      = React.useState<ProductMini[]>([]);

  const [discount,  setDiscount]  = React.useState(initial?.discount      ?? 0);
  const [freight,   setFreight]   = React.useState(initial?.freight_value ?? 0);
  const [notes,     setNotes]     = React.useState(initial?.notes          ?? "");
  const [internalNotes, setInternalNotes] = React.useState(initial?.internal_notes ?? "");
  const [validUntil,    setValidUntil]    = React.useState(initial?.valid_until?.slice(0, 10) ?? "");
  const [paymentTerms,  setPaymentTerms]  = React.useState(initial?.payment_terms  ?? "");
  const [paymentMethod, setPaymentMethod] = React.useState(initial?.payment_method ?? "");
  const [expectedDel,   setExpectedDel]   = React.useState(initial?.expected_delivery?.slice(0, 10) ?? "");
  const [sellerName,    setSellerName]    = React.useState(initial?.seller_name    ?? "");

  const [saving, setSaving] = React.useState(false);

  const { subtotal, total } = calcTotals(items, discount, freight);

  // ── buscar clientes (debounce 400ms) ──────────────────────────────────────
  React.useEffect(() => {
    if (customerSearch.length < 2) { setCustomers([]); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`${BASE}/customers?q=${encodeURIComponent(customerSearch)}&limit=20`, { headers: authH() });
        if (r.ok) setCustomers(await r.json());
      } catch { /* silencioso */ }
    }, 400);
    return () => clearTimeout(t);
  }, [customerSearch]);

  // ── buscar produtos (debounce 400ms) ──────────────────────────────────────
  React.useEffect(() => {
    if (productSearch.length < 2) { setProducts([]); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`${BASE}/products?q=${encodeURIComponent(productSearch)}&limit=20`, { headers: authH() });
        if (r.ok) setProducts(await r.json());
      } catch { /* silencioso */ }
    }, 400);
    return () => clearTimeout(t);
  }, [productSearch]);

  // ── ações de item ─────────────────────────────────────────────────────────
  const addProduct = (p: ProductMini) => {
    setItems((prev) => [
      ...prev,
      {
        _key:        crypto.randomUUID(),
        productId:   p.id,
        description: p.name,
        unit:        p.uom ?? p.unit ?? "UN",
        quantity:    1,
        unitPrice:   p.price,
      },
    ]);
    setProductSearch("");
    setProducts([]);
  };

  const updateItem = (key: string, field: keyof Omit<EditorItem, "_key">, value: string | number) => {
    setItems((prev) =>
      prev.map((it) => it._key === key ? { ...it, [field]: value } : it)
    );
  };

  const removeItem = (key: string) =>
    setItems((prev) => prev.filter((it) => it._key !== key));

  // ── salvar ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!customerId) { toast.error("Selecione um cliente."); return; }
    if (items.length === 0) { toast.error("Adicione ao menos 1 item."); return; }

    setSaving(true);
    try {
      const payload: QuoteCreate = {
        customerId,
        discount,
        freightValue:     freight       || undefined,
        notes:            notes         || null,
        internalNotes:    internalNotes || null,
        validUntil:       validUntil    || null,
        paymentTerms:     paymentTerms  || null,
        paymentMethod:    paymentMethod || null,
        expectedDelivery: expectedDel   || null,
        sellerName:       sellerName    || null,
        items: items.map((it) => ({
          productId:   it.productId  ?? undefined,
          description: it.description,
          unit:        it.unit       || "UN",
          quantity:    Number(it.quantity  ?? 0) || 0,
          unitPrice:   Number(it.unitPrice ?? 0) || 0,
        })),
      };
      await onSave(payload);
    } catch {
      toast.error("Erro ao salvar orçamento.");
    } finally {
      setSaving(false);
    }
  };


  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">
          {mode === "create" ? "Novo Orçamento" : "Editar Orçamento"}
        </h1>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700">
          ← Voltar
        </button>
      </div>

      {/* ── seção: cliente ── */}
      <section className="bg-white rounded-lg border p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Cliente</h2>

        {selectedCustomer || initial?.customer_id ? (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
            <div>
              <p className="font-medium text-gray-800">
                {selectedCustomer?.name ?? `Cliente #${customerId}`}
              </p>
              <p className="text-sm text-gray-500">
                {selectedCustomer?.document ?? ""}
              </p>
            </div>
            <button
              onClick={() => { setCustomerId(null); setSelectedCustomer(null); setCustomerSearch(""); }}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Trocar
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Buscar cliente por nome ou CPF/CNPJ…"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {customers.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-52 overflow-y-auto">
                {customers.map((c) => (
                  <li
                    key={c.id}
                    onClick={() => { setCustomerId(c.id); setSelectedCustomer(c); setCustomers([]); setCustomerSearch(""); }}
                    className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                  >
                    <span className="font-medium">{c.name}</span>
                    <span className="ml-2 text-gray-400">{c.document}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* ── seção: itens ── */}
      <section className="bg-white rounded-lg border p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Itens</h2>

        {/* busca de produto */}
        <div className="relative">
          <input
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Buscar produto para adicionar…"
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {products.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-52 overflow-y-auto">
              {products.map((p) => (
                <li
                  key={p.id}
                  onClick={() => addProduct(p)}
                  className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer flex justify-between"
                >
                  <span>{p.name}</span>
                  <span className="text-gray-400">{fmtBRL(p.price)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* tabela de itens */}
        {items.length > 0 && (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="p-2 text-left w-1/2">Descrição</th>
                <th className="p-2 text-center w-16">Un.</th>
                <th className="p-2 text-right w-24">Qtd</th>
                <th className="p-2 text-right w-28">Preço Unit.</th>
                <th className="p-2 text-right w-28">Total</th>
                <th className="p-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._key} className="border-t">
                  <td className="p-1">
                    <input
                      value={it.description}
                      onChange={(e) => updateItem(it._key, "description", e.target.value)}
                      className="w-full border-0 bg-transparent px-1 py-0.5 text-sm focus:outline-none focus:bg-blue-50 rounded"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      value={it.unit}
                      onChange={(e) => updateItem(it._key, "unit", e.target.value)}
                      className="w-full border-0 bg-transparent text-center px-1 py-0.5 text-sm focus:outline-none focus:bg-blue-50 rounded"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="number" min={0.001} step={0.001}
                      value={it.quantity}
                      onChange={(e) => updateItem(it._key, "quantity", Number(e.target.value))}
                      className="w-full border-0 bg-transparent text-right px-1 py-0.5 text-sm focus:outline-none focus:bg-blue-50 rounded"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="number" min={0} step={0.01}
                      value={it.unitPrice}
                      onChange={(e) => updateItem(it._key, "unitPrice", Number(e.target.value))}
                      className="w-full border-0 bg-transparent text-right px-1 py-0.5 text-sm focus:outline-none focus:bg-blue-50 rounded"
                    />
                  </td>
                  <td className="p-2 text-right text-gray-700 whitespace-nowrap">
                    {fmtBRL(it.quantity * it.unitPrice)}
                  </td>
                  <td className="p-1 text-center">
                    <button
                      onClick={() => removeItem(it._key)}
                      className="text-red-400 hover:text-red-600 text-lg leading-none"
                      title="Remover"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            Nenhum item adicionado. Busque um produto acima.
          </p>
        )}
      </section>

      {/* ── seção: totais ── */}
      <section className="bg-white rounded-lg border p-5">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Totais</h2>
        <div className="flex flex-col items-end gap-2 text-sm">
          <div className="flex gap-3 items-center">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium w-32 text-right">{fmtBRL(subtotal)}</span>
          </div>
          <div className="flex gap-3 items-center">
            <span className="text-gray-500">Desconto (R$)</span>
            <input
              type="number" min={0} step={0.01}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-32 border rounded px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex gap-3 items-center">
            <span className="text-gray-500">Frete (R$)</span>
            <input
              type="number" min={0} step={0.01}
              value={freight}
              onChange={(e) => setFreight(Number(e.target.value))}
              className="w-32 border rounded px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex gap-3 items-center border-t pt-2 mt-1">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="font-bold text-blue-700 text-base w-32 text-right">{fmtBRL(total)}</span>
          </div>
        </div>
      </section>

      {/* ── seção: detalhes comerciais ── */}
      <section className="bg-white rounded-lg border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Detalhes Comerciais</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

          <label className="flex flex-col gap-1">
            <span className="text-gray-500">Válido até</span>
            <input
              type="date" value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-gray-500">Previsão de entrega</span>
            <input
              type="date" value={expectedDel}
              onChange={(e) => setExpectedDel(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-gray-500">Condição de pagamento</span>
            <input
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="Ex: 30/60/90 dias"
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-gray-500">Forma de pagamento</span>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="">Selecione…</option>
              <option value="Boleto">Boleto</option>
              <option value="PIX">PIX</option>
              <option value="Cartão de crédito">Cartão de crédito</option>
              <option value="Transferência">Transferência</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="A combinar">A combinar</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-gray-500">Responsável / Vendedor</span>
            <input
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              placeholder="Nome do vendedor"
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>

        </div>
      </section>

      {/* ── seção: observações ── */}
      <section className="bg-white rounded-lg border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Observações</h2>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-500">Observações (visível no documento)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Informações que aparecerão no orçamento impresso…"
            className="border rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-500">
            Notas internas{" "}
            <span className="text-xs text-amber-600 font-medium">(não aparece no documento)</span>
          </span>
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={3}
            placeholder="Anotações internas, não visíveis para o cliente…"
            className="border rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
        </label>
      </section>

      {/* ── rodapé com botão salvar ── */}
      <div className="flex justify-end gap-3 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 text-sm border rounded text-gray-600 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {saving ? "Salvando…" : mode === "create" ? "Criar Orçamento" : "Salvar Alterações"}
        </button>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW / IMPRESSÃO (default export — sem mudanças)
// ═══════════════════════════════════════════════════════════════════════════════
function buildPrintData(
  q:        QuoteDetails,
  company:  CompanyData | null,
  customer: CustomerData | null,
): DocumentPrintData {
  return {
    kind:           "Orçamento",
    documentNumber: String(q.id).padStart(6, "0"),
    date:           q.created_at,
    validUntil:     q.valid_until      ?? undefined,
    status:         q.status,
    company: {
      name:          company?.name           ?? "",
      legalName:     company?.legal_name     ?? "",
      cnpj:          company?.cnpj           ?? "",
      address_line1: company?.address_line1  ?? "",
      city:          company?.city           ?? "",
      state:         company?.state          ?? "",
      zip_code:      company?.zip_code       ?? "",
      phone:         company?.phone          ?? undefined,
      email:         company?.email          ?? undefined,
      logo_base64:   company?.logo_base64    ?? undefined,
    },
    customer: {
      name:     customer?.name          ?? "—",
      document: customer?.document      ?? undefined,
      email:    customer?.email         ?? undefined,
      phone:    customer?.phone         ?? undefined,
      address: [
        customer?.billing_address_line1,
        customer?.billing_address_line2,
        customer?.billing_district,
        customer?.billing_city,
        customer?.billing_state,
      ].filter(Boolean).join(", ") || undefined,
    },
    payment: {
      terms:      q.payment_terms  ?? undefined,
      method:     q.payment_method ?? undefined,
      sellerName: q.seller_name    ?? undefined,
    },
    delivery: {
      expectedDate: q.expected_delivery ?? undefined,
    },
    items: q.items.map((it) => ({
      code:        it.product_sku ?? undefined,
      description: it.description,
      unit:        it.unit        ?? "UN",
      quantity:    Number(it.quantity   ?? 0) || 0,
      unitPrice:   Number(it.unit_price ?? 0) || 0,
      total:       Number(it.total      ?? 0) || 0,
    })),
    subtotal:     Number(q.subtotal   ?? 0) || 0,
    discount:     Number(q.discount   ?? 0) || 0,
    freightValue: Number(q.freight_value ?? 0) || 0,
    total:        Number(q.total      ?? 0) || 0,
    notes:        q.notes         ?? undefined,
  };
}

export default function QuoteDetailsPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quote,      setQuote]      = React.useState<QuoteDetails | null>(null);
  const [loading,    setLoading]    = React.useState(true);
  const [error,      setError]      = React.useState<string | null>(null);
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [acting,     setActing]     = React.useState(false);

  const token   = localStorage.getItem("token") ?? "";
  const quoteId = Number(id);

  const company  = useCompany();

  const fetchQuote = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${BASE}/quotes/${quoteId}`, { headers: authH() });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      const q    = data.quote ?? data;           // ← extrai quote aninhado
      const list = data.items ?? q.items ?? [];  // ← extrai items
      setQuote({ ...q, items: list } as QuoteDetails);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally { setLoading(false); }
  }, [quoteId, token]);

  const customer = useCustomer(quote?.customer_id ?? null);

  React.useEffect(() => { fetchQuote(); }, [fetchQuote]);

  const doAction = async (action: "approve" | "cancel") => {
    setActing(true);
    try {
      const res = await fetch(`${BASE}/quotes/${quoteId}/${action}`, {
        method: "PATCH", headers: authH(),
      });
      if (!res.ok) throw new Error();
      toast.success(action === "approve" ? "Orçamento aprovado!" : "Orçamento cancelado.");
      fetchQuote();
    } catch {
      toast.error(`Falha ao ${action === "approve" ? "aprovar" : "cancelar"}.`);
    } finally { setActing(false); }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => { window.print(); setIsPrinting(false); }, 300);
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Carregando orçamento…</div>;
  if (error || !quote) return <div className="p-8 text-center text-red-500">{error ?? "Não encontrado."}</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="no-print flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800">
          ← Voltar
        </button>
        <div className="flex items-center gap-2">
          {quote.status === "draft" && (
            <>
              <button onClick={() => doAction("approve")} disabled={acting}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                {acting ? "…" : "✓ Aprovar"}
              </button>
              <button onClick={() => doAction("cancel")} disabled={acting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
                {acting ? "…" : "✕ Cancelar"}
              </button>
            </>
          )}
          <button onClick={handlePrint} disabled={isPrinting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {isPrinting ? "Preparando…" : "🖨 Imprimir / PDF"}
          </button>
        </div>
      </div>
      <DocumentPrintLayout data={buildPrintData(quote, company, customer)} />
    </div>
  );
}
