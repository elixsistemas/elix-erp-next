import * as React from "react";
import { useParams } from "react-router-dom";
import { getQuote, getMyCompany, getCustomer } from "./quotes.service";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function line(v?: string | null) {
  return (v ?? "").trim();
}
function joinLine(...parts: Array<string | null | undefined>) {
  return parts.map(line).filter(Boolean).join(" ");
}

export default function QuotePrintPage() {
  const { id } = useParams();
  const quoteId = Number(id);

  const [data, setData] = React.useState<any>(null);
  const [company, setCompany] = React.useState<any>(null);
  const [customer, setCustomer] = React.useState<any>(null);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      const d = await getQuote(quoteId);
      if (!alive) return;

      setData(d);

      // carrega cabeçalho (empresa + cliente)
      const customerId = Number(d?.quote?.customer_id ?? 0);

      const [c1, c2] = await Promise.allSettled([
        getMyCompany(),
        customerId ? getCustomer(customerId) : Promise.resolve(null),
      ]);

      if (!alive) return;

      if (c1.status === "fulfilled") setCompany(c1.value);
      if (c2.status === "fulfilled") setCustomer(c2.value);
    })();

    return () => {
      alive = false;
    };
  }, [quoteId]);

  if (!data) return <div className="p-6">Carregando...</div>;

  const { quote, items } = data;

  const companyName = company?.trade_name || company?.legal_name || company?.name || "Minha Empresa";
  const companyDoc = company?.cnpj ? `CNPJ: ${company.cnpj}` : "";
  const companyContact = joinLine(company?.email, company?.phone ? `• ${company.phone}` : "");
  const companyAddress = joinLine(
    company?.address_line1,
    company?.district ? `- ${company.district}` : null,
    company?.city ? `- ${company.city}/${company?.state ?? ""}` : null,
    company?.zip_code ? `• CEP ${company.zip_code}` : null
  );

  const customerName = customer?.name || "Cliente";
  const customerDoc = customer?.document ? `Documento: ${customer.document}` : "";
  const customerContact = joinLine(customer?.email, customer?.phone ? `• ${customer.phone}` : "");
  const customerAddress = joinLine(
    customer?.billing_address_line1,
    customer?.billing_district ? `- ${customer.billing_district}` : null,
    customer?.billing_city ? `- ${customer.billing_city}/${customer?.billing_state ?? ""}` : null,
    customer?.billing_zip_code ? `• CEP ${customer.billing_zip_code}` : null
  );

  return (
    <div className="p-10 bg-white text-black">
      <style>{`
        @media print {
          .no-print { display: none; }
          body { background: white; }
        }
        .h1 { font-size: 22px; font-weight: 700; }
        .h2 { font-size: 14px; font-weight: 700; margin-top: 14px; }
        .muted { color: #555; }
        .box { border: 1px solid #e5e5e5; border-radius: 8px; padding: 12px; }
      `}</style>

      <div className="no-print mb-6 flex gap-2">
        <button onClick={() => window.print()} style={{ padding: "8px 12px", border: "1px solid #ddd" }}>
          Imprimir / Salvar PDF
        </button>
      </div>

      <div className="h1">Orçamento #{quote.id}</div>
      <div className="muted" style={{ marginTop: 4 }}>
        Status: {quote.status} • Data: {new Date(quote.created_at).toLocaleString("pt-BR")}
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="box">
          <div className="h2">Emitente</div>
          <div style={{ fontWeight: 700 }}>{companyName}</div>
          <div className="muted">{companyDoc}</div>
          <div className="muted">{companyContact}</div>
          <div className="muted" style={{ marginTop: 6 }}>{companyAddress}</div>
        </div>

        <div className="box">
          <div className="h2">Cliente</div>
          <div style={{ fontWeight: 700 }}>{customerName}</div>
          <div className="muted">{customerDoc}</div>
          <div className="muted">{customerContact}</div>
          <div className="muted" style={{ marginTop: 6 }}>{customerAddress}</div>
        </div>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <div className="h2">Itens</div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
        <thead>
          <tr>
            {["Produto", "Descrição", "Qtd", "Unitário", "Total"].map((h) => (
              <th key={h} style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 6px" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((it: any) => (
            <tr key={it.id}>
              <td style={{ padding: "8px 6px", borderBottom: "1px solid #f0f0f0" }}>
                {it.product_name ?? `#${it.product_id}`}
              </td>
              <td style={{ padding: "8px 6px", borderBottom: "1px solid #f0f0f0" }}>{it.description}</td>
              <td style={{ padding: "8px 6px", borderBottom: "1px solid #f0f0f0" }}>
                {Number(it.quantity).toFixed(3).replace(".", ",")}
              </td>
              <td style={{ padding: "8px 6px", borderBottom: "1px solid #f0f0f0" }}>
                {brl.format(Number(it.unit_price))}
              </td>
              <td style={{ padding: "8px 6px", borderBottom: "1px solid #f0f0f0" }}>
                {brl.format(Number(it.total))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 16, width: 340, marginLeft: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span>Subtotal</span>
          <strong>{brl.format(Number(quote.subtotal))}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span>Desconto</span>
          <strong>{brl.format(Number(quote.discount))}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #ddd", paddingTop: 8 }}>
          <span>Total</span>
          <strong>{brl.format(Number(quote.total))}</strong>
        </div>
      </div>

      {quote.notes ? (
        <>
          <hr style={{ margin: "16px 0" }} />
          <div className="h2">Observações</div>
          <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{quote.notes}</div>
        </>
      ) : null}
    </div>
  );
}
