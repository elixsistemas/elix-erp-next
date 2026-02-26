// src/pages/comercial/pedidos/PedidoPrintPage.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DocumentPrintLayout } from "../_shared/DocumentPrintLayout";
import type { DocumentPrintData } from "../_shared/DocumentPrintLayout";
import { useCompany }        from "../orcamentos/useCompany";
import { useCustomer }       from "../orcamentos/useCustomer";
import type { CompanyData }  from "../orcamentos/useCompany";
import type { CustomerData } from "../orcamentos/useCustomer";
import type { OrderRow, OrderItemRow } from "./orders.types";
import { Loader2 } from "lucide-react";



const BASE  = "http://localhost:3333";
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` });

function buildPrintData(
  o:        OrderRow & { items: OrderItemRow[] },
  company:  CompanyData | null,
  customer: CustomerData | null,
): DocumentPrintData {
  return {
    kind:           "Pedido",
    documentNumber: String(o.id).padStart(6, "0"),
    date:           o.createdAt,
    status:         o.status as DocumentPrintData["status"],

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
        // 1️⃣ endereço de entrega do pedido
        o.deliveryStreet          // ← agora existe em OrderRow ✅
          ? [
              o.deliveryStreet,
              o.deliveryNumber,
              o.deliveryNeighborhood,
              o.deliveryCity,
              o.deliveryState,
            ].filter(Boolean).join(", ")
          // 2️⃣ fallback: cobrança do cliente
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
      terms:      o.paymentTerms  ?? undefined,
      method:     o.paymentMethod ?? undefined,
      sellerName: o.sellerName    ?? undefined,
    },

    delivery: {
      expectedDate: o.expectedDelivery ?? undefined,
      transport:    o.transportMode    ?? undefined,
    },

    items: o.items.map((it, idx) => ({
      seq:         idx + 1,
      code:        undefined,          // OrderItemRow não tem SKU direto
      description: it.description,
      unit:        it.unit ?? "UN",
      quantity:    it.quantity,
      unitPrice:   it.unitPrice,
      total:       it.total,
    })),

    subtotal:     o.subtotal,
    discount:     o.discount      ?? 0,
    freightValue: o.freightValue  ?? 0,
    total:        o.total,
    notes:        o.notes         ?? undefined,
  };
}

export default function PedidoPrintPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = React.useState<OrderRow & { items: OrderItemRow[] } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error,   setError]   = React.useState<string | null>(null);

  const orderId = Number(id);
  const company  = useCompany();
  const customer = useCustomer(order?.customerId ?? null);

  React.useEffect(() => {
    fetch(`${BASE}/orders/${orderId}`, { headers: authH() })
      .then(r => { if (!r.ok) throw new Error(`Erro ${r.status}`); return r.json(); })
      .then(setOrder)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
  if (error || !order) return (
    <div className="p-8 text-center text-red-500">{error ?? "Pedido não encontrado."}</div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* barra de ações */}
      <div className="no-print flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm">
        <button
          onClick={() => navigate(`/comercial/pedidos/${orderId}`)}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          ← Voltar ao Pedido
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🖨 Imprimir / PDF
        </button>
      </div>

      <DocumentPrintLayout data={buildPrintData(order, company, customer)} />
    </div>
  );
}
