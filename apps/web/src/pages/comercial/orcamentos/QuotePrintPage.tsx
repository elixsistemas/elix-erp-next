import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuote, getMyCompany, getCustomer } from "./quotes.service";
import { DocumentPrintLayout, type DocumentPrintData } from "../_shared/DocumentPrintLayout";
import { Button }  from "@/components/ui/button";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";

export default function QuotePrintPage() {
  const { id }  = useParams();
  const nav     = useNavigate();
  const quoteId = Number(id);

  const [data,    setData]    = React.useState<DocumentPrintData | null>(null);
  const [error,   setError]   = React.useState("");

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const detail = await getQuote(quoteId);
        const { quote, items } = detail;

        const customerId = Number(quote.customer_id ?? 0);

        const [companyRes, customerRes] = await Promise.allSettled([
          getMyCompany(),
          customerId ? getCustomer(customerId) : Promise.resolve(null),
        ]);

        if (!alive) return;

        const company  = companyRes.status  === "fulfilled" ? companyRes.value  : {};
        const customer = customerRes.status === "fulfilled" ? customerRes.value : null;

        setData({
          kind:           "Orçamento",
          documentNumber: String(quote.id).padStart(6, "0"),  // ✅ number → string formatada
          date:           quote.created_at,
          validUntil:     quote.valid_until     ?? undefined,  // ✅ melhoria 1
          status:         quote.status,                        // ✅ melhoria 5

          company,

          customer: {
            name:     customer?.name     ?? "Cliente",
            document: customer?.document ?? undefined,
            email:    customer?.email    ?? undefined,
            phone:    customer?.phone    ?? undefined,
            // ✅ PrintCustomer tem só "address" (string), não campos separados
            address: [
              customer?.billing_street,
              customer?.billing_number,
              customer?.billing_neighborhood,
              customer?.billing_city,
              customer?.billing_state,
              customer?.billing_zip_code,
            ]
              .filter(Boolean)
              .join(", ") || undefined,
          },

          payment: {                                           // ✅ melhorias 2 e 4
            terms:      quote.payment_terms  ?? undefined,
            method:     quote.payment_method ?? undefined,
            sellerName: quote.seller_name    ?? undefined,
          },

          delivery: {                                          // ✅ melhoria 2
            expectedDate: quote.expected_delivery ?? undefined,
          },

          items: items.map((it: any, idx: number) => ({
            seq:         idx + 1,                              // ✅ obrigatório em PrintItem
            code:        it.product_sku  ?? undefined,         // ✅ melhoria 3
            description: it.description,
            unit:        it.unit         ?? "UN",              // ✅ melhoria 8
            quantity:    Number(it.quantity),
            unitPrice:   Number(it.unit_price),
            total:       Number(it.total),
          })),

          subtotal:     Number(quote.subtotal),
          discount:     Number(quote.discount)      ?? 0,
          freightValue: Number(quote.freight_value) ?? 0,      // ✅ melhoria 7
          total:        Number(quote.total),
          notes:        quote.notes ?? undefined,
          // internalNotes: NÃO vai para impressão — proposital
        });
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Erro ao carregar dados para impressão.");
      }
    })();

    return () => { alive = false; };
  }, [quoteId]);

  if (error) return (
    <div className="p-8 text-red-500">{error}</div>
  );

  if (!data) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div>
      {/* barra de controle — some na impressão */}
      <div className="print:hidden flex gap-2 p-4 border-b bg-background sticky top-0 z-10">
        <Button variant="outline" onClick={() => nav(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Imprimir / Salvar PDF
        </Button>
      </div>

      <DocumentPrintLayout data={data} />
    </div>
  );
}
