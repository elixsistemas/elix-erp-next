// src/pages/comercial/vendas/VendaPrintPage.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DocumentPrintLayout }    from "../_shared/DocumentPrintLayout";
import type { DocumentPrintData } from "../_shared/DocumentPrintLayout";
import { useCompany }             from "../orcamentos/useCompany";
import { useCustomer }            from "../orcamentos/useCustomer";
import type { CompanyData }       from "../orcamentos/useCompany";
import type { CustomerData }      from "../orcamentos/useCustomer";
import type { SaleRow, SaleItemRow } from "./sales.types";
import { Loader2 } from "lucide-react";

type SaleDetails = SaleRow & { items: SaleItemRow[] };

const BASE  = "http://localhost:3333";
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` });

function buildPrintData(
  s:        SaleDetails,
  company:  CompanyData | null,
  customer: CustomerData | null,
): DocumentPrintData {
  return {
    kind:           "Venda",
    documentNumber: String(s.id).padStart(6, "0"),
    date:           s.createdAt,
    status:         s.status as DocumentPrintData["status"],

    company: {
      name:          company?.name          ?? "",
      legalName:     company?.legal_name    ?? "",
      cnpj:          company?.cnpj          ?? "",
      address_line1: company?.address_line1 ?? "",
      city:          company?.city          ?? "",
      state:         company?.state         ?? "",
      zip_code:      company?.zip_code      ?? "",
      phone:         company?.phone         ?? undefined,
      email:         company?.email         ?? undefined,
      logo_base64:   company?.logo_base64   ?? undefined,
    },

    customer: {
      name:     customer?.name     ?? "—",
      document: customer?.document ?? undefined,
      email:    customer?.email    ?? undefined,
      phone:    customer?.phone    ?? undefined,
      address: (
        s.deliveryStreet
          ? [s.deliveryStreet, 
             s.deliveryNumber,
             s.deliveryComplement, 
             s.deliveryNeighborhood,
             s.deliveryCity, 
             s.deliveryState,
            s.deliveryZipcode
                ? `CEP ${s.deliveryZipcode}` : null,
            ].filter(Boolean).join(", ")
          : [
              customer?.billing_address_line1,
              customer?.billing_address_line2,
              customer?.billing_district,
              customer?.billing_city,
              customer?.billing_state,
            ].filter(Boolean).join(", ")
      ) || undefined,
    },

    payment: {
      terms:      s.paymentTerms  ?? undefined,
      method:     s.paymentMethod ?? undefined,
      sellerName: s.sellerName    ?? undefined,
    },

    delivery: {
      expectedDate: s.expectedDelivery ?? undefined,
      transport:    s.transportMode    ?? undefined,
    },

    // ── sem seq (não existe em PrintItem) ──────────────────
    items: s.items.map((it) => ({
      code:        it.productSku  ?? undefined,
      description: it.description,
      unit:        it.unit        ?? "UN",
      quantity:    Number(it.quantity  ?? 0) || 0,
      unitPrice:   Number(it.unitPrice ?? 0) || 0,
      total:       Number(it.total     ?? 0) || 0,
    })),

    subtotal:     Number(s.subtotal    ?? 0) || 0,
    discount:     Number(s.discount    ?? 0) || 0,
    freightValue: Number(s.freightValue ?? 0) || 0,
    total:        Number(s.total       ?? 0) || 0,
    notes:        s.notes ?? undefined,
  };
}

export default function VendaPrintPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sale,    setSale]    = React.useState<SaleDetails | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error,   setError]   = React.useState<string | null>(null);

  const saleId  = Number(id);
  const company  = useCompany();
  const customer = useCustomer(sale?.customerId ?? null);

  React.useEffect(() => {
    fetch(`${BASE}/sales/${saleId}`, { headers: authH() })
      .then(r => { if (!r.ok) throw new Error(`Erro ${r.status}`); return r.json(); })
      // ── Bug 1 fix: normaliza resposta aninhada ────────────
      .then(data => {
        const s    = data.sale ?? data;
        const list = data.items ?? s.items ?? [];
        setSale({ ...s, items: list } as SaleDetails);
      })
      .catch(e  => setError(e.message))
      .finally(() => setLoading(false));
  }, [saleId]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
  if (error || !sale) return (
    <div className="p-8 text-center text-red-500">{error ?? "Venda não encontrada."}</div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="no-print flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm">
        <button
          onClick={() => navigate(`/comercial/vendas/${saleId}`)}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          ← Voltar à Venda
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🖨 Imprimir / PDF
        </button>
      </div>
      <DocumentPrintLayout data={buildPrintData(sale, company, customer)} />
    </div>
  );
}
