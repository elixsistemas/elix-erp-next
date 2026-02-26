// src/pages/comercial/_shared/DocumentPrintLayout.tsx
import { maskCNPJ, maskCep, maskPhoneBR } from "@/shared/br/masks";
import { onlyDigits } from "@/shared/br/digits";

// ── tipos ────────────────────────────────────────────────────
export type PrintItem = {
  code?:        string | null;   // ← novo (SKU) — melhoria 3
  description:  string;
  quantity:     number;
  unit?:        string | null;   // ← novo — melhoria 8
  unitPrice:    number;
  total:        number;
};

export type PrintCompany = {
  trade_name?:    string | null;
  legalName?:    string | null;
  name?:          string | null;
  cnpj?:          string | null;
  document?:      string | null;
  phone?:         string | null;
  email?:         string | null;
  website?:       string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  district?:      string | null;
  city?:          string | null;
  state?:         string | null;
  zip_code?:      string | null;
  logo_base64?:   string | null;
};

export type PrintCustomer = {
  name:                   string;
  document?:              string | null;
  email?:                 string | null;
  phone?:                 string | null;
  address?:               string | null;
  billing_street?:        string | null;
  billing_number?:        string | null;
  billing_neighborhood?:  string | null;
  billing_city?:          string | null;
  billing_state?:         string | null;
  billing_zip_code?:      string | null;
};

export type PrintDelivery = {
  expectedDate?:  string | null;
  transport?:     string | null;
  street?:        string | null;
  number?:        string | null;
  neighborhood?:  string | null;
  city?:          string | null;
  state?:         string | null;
  zipcode?:       string | null;
};

export type PrintPayment = {
  terms?:      string | null;
  method?:     string | null;
  sellerName?: string | null;
};

export type DocumentPrintData = {
  kind:            "Orçamento" | "Pedido" | "Venda";
  documentNumber:  string;
  date:            string;
  validUntil?:     string | null;   // ← novo — melhoria 1
  status?:         string | null;   // ← novo — melhoria 5
  company:         PrintCompany;
  customer:        PrintCustomer;
  items:           PrintItem[];
  subtotal:        number;
  discount:        number;
  freightValue?:   number;          // ← novo — melhoria 7
  total:           number;
  payment?:        PrintPayment;
  delivery?:       PrintDelivery;
  notes?:          string | null;
  // internalNotes intencionalmente ausente — nunca aparece no documento impresso
};

// ── helpers ──────────────────────────────────────────────────
const fmt = (v: number | null | undefined) =>
  (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtQty = (v: number | null | undefined) =>
  (v ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

const fmtDate = (s?: string | null) => {
  if (!s) return "";
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleDateString("pt-BR");
};

const fmtDoc = (doc?: string | null) => {
  if (!doc) return "";
  const d = onlyDigits(doc);
  if (d.length === 14) return maskCNPJ(d);
  if (d.length === 11) return `CPF: ${d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}`;
  return doc;
};

// ── badge de status — melhoria 5 ─────────────────────────────
function StatusBadgePrint({ status }: { status?: string | null }) {
  if (!status) return null;
  const map: Record<string, { label: string; color: string }> = {
    draft:     { label: "Rascunho",   color: "#888888" },
    pending:   { label: "Em Aberto",  color: "#d97706" },
    approved:  { label: "Aprovado",   color: "#16a34a" },
    cancelled: { label: "Cancelado",  color: "#dc2626" },
    confirmed: { label: "Confirmado", color: "#2563eb" },
    completed: { label: "Concluído",  color: "#16a34a" },
  };
  const s = map[status] ?? { label: status, color: "#888" };
  return (
    <div style={{
      display:       "inline-block",
      marginTop:     6,
      padding:       "2px 10px",
      borderRadius:  4,
      border:        `1.5px solid ${s.color}`,
      color:         s.color,
      fontSize:      10,
      fontWeight:    700,
      letterSpacing: 1,
      textTransform: "uppercase",
    }}>
      {s.label}
    </div>
  );
}

// ── componente principal ─────────────────────────────────────
export function DocumentPrintLayout({ data }: { data: DocumentPrintData }) {
  const { company, customer, delivery, payment } = data;

  const companyName = company.trade_name || company.legalName || company.name || "Minha Empresa";
  const companyDoc  = company.cnpj ? fmtDoc(company.cnpj) : fmtDoc(company.document);

  const companyAddr = [
    company.address_line1,
    company.address_line2,
    company.district,
    [company.city, company.state].filter(Boolean).join("/"),
    company.zip_code ? `CEP ${maskCep(onlyDigits(company.zip_code))}` : null,
  ].filter(Boolean).join(" · ");

  const customerDoc  = fmtDoc(customer.document);
    const customerAddr = customer.address || [
    customer.billing_street,
    customer.billing_number,
    customer.billing_neighborhood,
    [customer.billing_city, customer.billing_state].filter(Boolean).join("/"),
    customer.billing_zip_code
        ? `CEP ${maskCep(onlyDigits(customer.billing_zip_code))}`
        : null,
    ].filter(Boolean).join(", ");

  const deliveryAddr = delivery ? [
    delivery.street, delivery.number, delivery.neighborhood,
    [delivery.city, delivery.state].filter(Boolean).join("/"),
    delivery.zipcode ? `CEP ${maskCep(onlyDigits(delivery.zipcode))}` : null,
  ].filter(Boolean).join(", ") : "";

  const totalQty    = data.items.reduce((a, i) => a + i.quantity, 0);
  const hasFreight  = (data.freightValue ?? 0) > 0;
  const hasPayBlock = !!(payment || delivery);

  // colunas da tabela: # | Código | Descrição | Un. | Qtd | Preço Unit. | Total
  const headers = ["#", "Código", "Descrição", "Un.", "Qtd", "Preço Unit.", "Total"];
  const colWidths = [24, 70, "auto", 36, 48, 90, 90];
  const colAlign  = (i: number) =>
    i === 0 ? "center" : i <= 2 ? "left" : "right";

  return (
    <>
      {/* ── CSS de impressão ── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-root, #print-root * { visibility: visible !important; }
          #print-root {
            position: fixed;
            top: 0; left: 0;
            width: 100%;
            margin: 0; padding: 0;
          }
          @page { size: A4 portrait; margin: 12mm 14mm; }
        }
        .print-doc-wrapper * { box-sizing: border-box; }
      `}</style>

      <div id="print-root"
           className="print-doc-wrapper font-sans text-[13px] text-gray-800 bg-white max-w-[800px] mx-auto px-10 py-8">

        {/* ══ CABEÇALHO ══════════════════════════════════════════ */}
        <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "flex-start", borderBottom: "2.5px solid #1a1a1a",
                      paddingBottom: 14, marginBottom: 14 }}>

          {/* esquerda: logo + empresa */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {company.logo_base64 && (
              <img src={company.logo_base64} alt="Logo"
                   style={{ maxHeight: 60, maxWidth: 120, objectFit: "contain" }} />
            )}
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>
                {companyName}
              </div>
              {company.legalName && company.trade_name && (
                <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>
                  {company.legalName}
                </div>
              )}
              {companyDoc && (
                <div style={{ fontSize: 11, color: "#555" }}>CNPJ: {companyDoc}</div>
              )}
              {companyAddr && (
                <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{companyAddr}</div>
              )}
              <div style={{ display: "flex", gap: 12, marginTop: 2, flexWrap: "wrap" }}>
                {company.phone && (
                  <span style={{ fontSize: 11, color: "#555" }}>
                    Tel: {maskPhoneBR(onlyDigits(company.phone))}
                  </span>
                )}
                {company.email   && <span style={{ fontSize: 11, color: "#555" }}>{company.email}</span>}
                {company.website && <span style={{ fontSize: 11, color: "#555" }}>{company.website}</span>}
              </div>
            </div>
          </div>

          {/* direita: tipo + número + datas + status */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#444",
                          textTransform: "uppercase", letterSpacing: 1 }}>
              {data.kind}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "monospace",
                          lineHeight: 1, marginTop: 2 }}>
              #{data.documentNumber
                    ? String(data.documentNumber).padStart(6, "0")
                    : "??????"}
            </div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
              Emissão: {fmtDate(data.date)}
            </div>
            {/* melhoria 1 — validade */}
            {data.validUntil && (
              <div style={{ fontSize: 11, color: "#b45309", fontWeight: 600 }}>
                Válido até: {fmtDate(data.validUntil)}
              </div>
            )}
            {delivery?.expectedDate && (
              <div style={{ fontSize: 11, color: "#666" }}>
                Entrega: {fmtDate(delivery.expectedDate)}
              </div>
            )}
            {/* melhoria 5 — badge de status */}
            <StatusBadgePrint status={data.status} />
          </div>
        </div>

        {/* ══ CLIENTE + PAGAMENTO/ENTREGA ════════════════════════ */}
        <div style={{ display: "grid",
                      gridTemplateColumns: hasPayBlock ? "1fr 1fr" : "1fr",
                      gap: 12, marginBottom: 16 }}>

          {/* cliente */}
          <div style={{ padding: "10px 12px", border: "1px solid #e5e5e5",
                        borderRadius: 6, background: "#fafafa" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#888",
                          textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
              Cliente
            </div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{customer.name}</div>
            {customerDoc  && <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>CNPJ/CPF: {customerDoc}</div>}
            {customerAddr && <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{customerAddr}</div>}
            {customer.phone && (
              <div style={{ fontSize: 11, color: "#555" }}>
                Tel: {maskPhoneBR(onlyDigits(customer.phone))}
              </div>
            )}
            {customer.email && <div style={{ fontSize: 11, color: "#555" }}>{customer.email}</div>}
          </div>

          {/* pagamento / entrega — melhoria 2 (condições + prazo) */}
          {hasPayBlock && (
            <div style={{ padding: "10px 12px", border: "1px solid #e5e5e5",
                          borderRadius: 6, background: "#fafafa" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#888",
                            textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                {data.kind === "Pedido" ? "Entrega / Pagamento" : "Pagamento"}
              </div>
              {/* melhoria 4 — vendedor */}
              {payment?.sellerName && (
                <div style={{ fontSize: 11 }}>Vendedor: <b>{payment.sellerName}</b></div>
              )}
              {payment?.terms  && <div style={{ fontSize: 11 }}>Condição: {payment.terms}</div>}
              {payment?.method && <div style={{ fontSize: 11 }}>Forma: {payment.method}</div>}
              {delivery?.transport && (
                <div style={{ fontSize: 11 }}>Transporte: {delivery.transport}</div>
              )}
              {deliveryAddr && (
                <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{deliveryAddr}</div>
              )}
            </div>
          )}
        </div>

        {/* ══ TABELA DE ITENS — melhoria 3 (código) + melhoria 8 (un.) ══ */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              {headers.map((h, i) => (
                <th key={h} style={{
                  padding:       "7px 8px",
                  textAlign:     colAlign(i) as any,
                  fontSize:      11,
                  fontWeight:    700,
                  color:         "#333",
                  borderTop:     "1.5px solid #ccc",
                  borderBottom:  "1.5px solid #ccc",
                  whiteSpace:    "nowrap",
                  width:         colWidths[i],
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                <td style={{ padding: "6px 8px", textAlign: "center", color: "#aaa", fontSize: 11 }}>
                  {i + 1}
                </td>
                <td style={{ padding: "6px 8px", fontSize: 11, color: "#666", fontFamily: "monospace" }}>
                  {item.code ?? "—"}
                </td>
                <td style={{ padding: "6px 8px", fontSize: 12 }}>
                  {item.description}
                </td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontSize: 11, color: "#666" }}>
                  {item.unit ?? "UN"}
                </td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontSize: 12 }}>
                  {fmtQty(item.quantity)}
                </td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontSize: 12 }}>
                  {fmt(item.unitPrice)}
                </td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600, fontSize: 12 }}>
                  {fmt(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ══ TOTAIS — melhoria 7 (frete) ════════════════════════ */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <div style={{ minWidth: 260, border: "1px solid #e0e0e0",
                        borderRadius: 6, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between",
                          padding: "6px 12px", background: "#f9f9f9", fontSize: 12, color: "#555" }}>
              <span>Total peças</span><span>{fmtQty(totalQty)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between",
                          padding: "6px 12px", fontSize: 12, color: "#555" }}>
              <span>Subtotal</span><span>{fmt(data.subtotal)}</span>
            </div>
            {data.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between",
                            padding: "6px 12px", fontSize: 12, color: "#c00" }}>
                <span>Desconto</span><span>− {fmt(data.discount)}</span>
              </div>
            )}
            {hasFreight && (
              <div style={{ display: "flex", justifyContent: "space-between",
                            padding: "6px 12px", fontSize: 12, color: "#555" }}>
                <span>Frete</span><span>{fmt(data.freightValue!)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between",
                          padding: "8px 12px", background: "#1a1a1a", color: "#fff",
                          fontSize: 14, fontWeight: 700 }}>
              <span>Total Geral</span><span>{fmt(data.total)}</span>
            </div>
          </div>
        </div>

        {/* ══ OBSERVAÇÕES — melhoria 9 (só obs do cliente aparece) ══ */}
        {data.notes && (
          <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: 10, marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#888",
                          textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
              Observações
            </div>
            <div style={{ fontSize: 12, color: "#444", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {data.notes}
            </div>
          </div>
        )}

        {/* ══ ASSINATURA — melhoria 6 ════════════════════════════ */}
        <div style={{ marginTop: 40, display: "grid",
                      gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          <div>
            <div style={{ borderTop: "1px solid #555", paddingTop: 4,
                          fontSize: 10, color: "#666", textAlign: "center" }}>
              Assinatura do Cliente / Data
            </div>
          </div>
          <div>
            <div style={{ borderTop: "1px solid #555", paddingTop: 4,
                          fontSize: 10, color: "#666", textAlign: "center" }}>
              {payment?.sellerName ?? "Vendedor"} / Data
            </div>
          </div>
        </div>

        {/* ══ RODAPÉ ═════════════════════════════════════════════ */}
        <div style={{ borderTop: "1px solid #ddd", marginTop: 16, paddingTop: 6,
                      display: "flex", justifyContent: "space-between",
                      fontSize: 10, color: "#aaa" }}>
          <span>Impresso em {new Date().toLocaleString("pt-BR")}</span>
          <span style={{ color: "#bbb" }}>
            {data.kind} #{String(data.documentNumber ?? "").padStart(6, "0")}
          </span>
          <span>{companyName}</span>
        </div>

      </div>
    </>
  );
}
