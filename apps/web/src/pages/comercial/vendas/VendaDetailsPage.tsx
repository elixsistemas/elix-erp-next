// src/pages/comercial/vendas/VendaDetailsPage.tsx
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StatusBadge }      from "../_shared/StatusBadge";
import { TotalsCard }       from "../_shared/TotalsCard";
import { SellerCombobox }   from "../_shared/SellerCombobox";
import { CustomerCombobox } from "../_shared/CustomerCombobox";
import { ProductCombobox }  from "../_shared/ProductCombobox";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Label }     from "@/components/ui/label";
import { Textarea }  from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
         AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
         AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, CheckCircle, Loader2, Printer, Save, Trash2, XCircle, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { ptbrDecimal } from "../orcamentos/components/ptbrDecimal";
import type { SaleRow, SaleItemRow, SaleCreate } from "./sales.types";

// ─── tipos internos ───────────────────────────────────────────────────────────
type SaleDetails = SaleRow & { items: SaleItemRow[] };

type DraftItem = {
  _key:        string;
  productId:   number | null;
  description: string;
  unit:        string;
  quantity:    number;
  unitPrice:   number;
  qtyText:     string;
  priceText:   string;
};

function newItem(): DraftItem {
  return {
    _key: crypto.randomUUID(),
    productId: null, description: "",
    unit: "UN",
    quantity: 1, unitPrice: 0,
    qtyText: "1", priceText: "0,00",
  };
}

const BASE  = "http://localhost:3333";
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` });

// ═════════════════════════════════════════════════════════════════════════════
export default function VendaDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const nav    = useNavigate();
  const isNew  = id === "new";
  const numId  = isNew ? null : Number(id);

  // ── remote state ──────────────────────────────────────────────────────────
  const [sale,    setSale]    = React.useState<SaleDetails | null>(null);
  const [loading, setLoading] = React.useState(!isNew);
  const [saving,  setSaving]  = React.useState(false);
  const [acting,  setActing]  = React.useState(false);

  // ── form state ────────────────────────────────────────────────────────────
  const [customerId,      setCustomerId]      = React.useState<number | null>(null);
  const [sellerId,        setSellerId]        = React.useState<number | null>(null);
  const [discount,        setDiscount]        = React.useState(0);
  const [discountText,    setDiscountText]    = React.useState("0,00");
  const [freight,         setFreight]         = React.useState(0);
  const [freightText,     setFreightText]     = React.useState("0,00");
  const [paymentTerms,    setPaymentTerms]    = React.useState("");
  const [paymentMethod,   setPaymentMethod]   = React.useState("");
  const [transportMode,   setTransportMode]   = React.useState("");
  const [expectedDel,     setExpectedDel]     = React.useState("");
  const [notes,           setNotes]           = React.useState("");
  const [internalNotes,   setInternalNotes]   = React.useState("");
  const [draftItems,      setDraftItems]      = React.useState<DraftItem[]>([newItem()]);

  // entrega
  const [delZipcode,      setDelZipcode]      = React.useState("");
  const [delStreet,       setDelStreet]       = React.useState("");
  const [delNumber,       setDelNumber]       = React.useState("");
  const [delComplement,   setDelComplement]   = React.useState("");
  const [delNeighborhood, setDelNeighborhood] = React.useState("");
  const [delCity,         setDelCity]         = React.useState("");
  const [delState,        setDelState]        = React.useState("");

  // ── carregar venda ────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (isNew) return;
    setLoading(true);
    fetch(`${BASE}/sales/${numId}`, { headers: authH() })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: SaleDetails) => {
        setSale(data);
        setCustomerId(data.customerId);
        setSellerId(data.sellerId ?? null);
        setDiscount(data.discount);
        setDiscountText(ptbrDecimal.format(data.discount));
        setFreight(data.freightValue ?? 0);
        setFreightText(ptbrDecimal.format(data.freightValue ?? 0));
        setPaymentTerms(data.paymentTerms   ?? "");
        setPaymentMethod(data.paymentMethod ?? "");
        setTransportMode(data.transportMode ?? "");
        setExpectedDel(data.expectedDelivery ? data.expectedDelivery.slice(0, 10) : "");
        setNotes(data.notes ?? "");
        setInternalNotes(data.internalNotes ?? "");
        setDelZipcode(data.deliveryZipcode      ?? "");
        setDelStreet(data.deliveryStreet        ?? "");
        setDelNumber(data.deliveryNumber        ?? "");
        setDelComplement(data.deliveryComplement ?? "");
        setDelNeighborhood(data.deliveryNeighborhood ?? "");
        setDelCity(data.deliveryCity   ?? "");
        setDelState(data.deliveryState ?? "");
        setDraftItems(data.items.map(i => ({
          _key:        crypto.randomUUID(),
          productId:   i.productId,
          description: i.description,
          unit:        i.unit ?? "UN",
          quantity:    i.quantity,
          unitPrice:   i.unitPrice,
          qtyText:     ptbrDecimal.format(i.quantity),
          priceText:   ptbrDecimal.format(i.unitPrice),
        })));
      })
      .catch(() => toast.error("Erro ao carregar venda"))
      .finally(() => setLoading(false));
  }, [numId, isNew]);

  const isLocked = !!sale && sale.status !== "draft";

  // ── totais ────────────────────────────────────────────────────────────────
  const subtotal = draftItems.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
  const total    = Math.max(0, subtotal - discount + freight);

  // ── helpers itens ─────────────────────────────────────────────────────────
  const updateItem = (key: string, patch: Partial<DraftItem>) =>
    setDraftItems(prev => prev.map(i => i._key === key ? { ...i, ...patch } : i));

  const removeItem = (key: string) =>
    setDraftItems(prev => prev.filter(i => i._key !== key));

  // ── salvar ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!customerId) return toast.error("Selecione um cliente");
    if (!draftItems.length || draftItems.some(i => !i.description))
      return toast.error("Preencha a descrição de todos os itens");

    setSaving(true);
    try {
      const payload: SaleCreate = {
        customerId,
        sellerId:             sellerId ?? undefined,
        discount,
        freightValue:         freight        || undefined,
        internalNotes:        internalNotes  || null,
        paymentTerms:         paymentTerms   || null,
        paymentMethod:        paymentMethod  || null,
        transportMode:        transportMode  || null,
        expectedDelivery:     expectedDel    || null,
        deliveryZipcode:      delZipcode     || null,
        deliveryStreet:       delStreet      || null,
        deliveryNumber:       delNumber      || null,
        deliveryComplement:   delComplement  || null,
        deliveryNeighborhood: delNeighborhood || null,
        deliveryCity:         delCity        || null,
        deliveryState:        delState       || null,
        notes:                notes          || null,
        items: draftItems.map(i => ({
          productId:   i.productId ?? null,
          description: i.description,
          unit:        i.unit || "UN",
          quantity:    i.quantity,
          unitPrice:   i.unitPrice,
        })),
      };

      if (isNew) {
        const res = await fetch(`${BASE}/sales`, {
          method: "POST",
          headers: { ...authH(), "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const created = await res.json();
        toast.success("Venda criada!");
        nav(`/comercial/vendas/${created.sale.id}`, { replace: true });
      } else {
        const res = await fetch(`${BASE}/sales/${numId}`, {
          method: "PATCH",
          headers: { ...authH(), "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        toast.success("Venda salva!");
      }
    } catch {
      toast.error("Erro ao salvar venda");
    } finally {
      setSaving(false);
    }
  };

  // ── concluir / cancelar ───────────────────────────────────────────────────
  const doAction = async (action: "complete" | "cancel") => {
    setActing(true);
    try {
      const res = await fetch(`${BASE}/sales/${numId}/${action}`, {
        method: "PATCH", headers: authH(),
      });
      if (!res.ok) throw new Error();
      toast.success(action === "complete" ? "Venda concluída!" : "Venda cancelada.");
      // recarregar
      const updated = await fetch(`${BASE}/sales/${numId}`, { headers: authH() });
      setSale(await updated.json());
    } catch {
      toast.error(`Falha ao ${action === "complete" ? "concluir" : "cancelar"} venda.`);
    } finally {
      setActing(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="p-6 space-y-4 max-w-5xl mx-auto">

      {/* ── header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => nav("/comercial/vendas")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                {isNew ? "Nova Venda" : `Venda #${String(numId).padStart(4, "0")}`}
              </h1>
              {sale && <StatusBadge status={sale.status} />}
            </div>
            {sale && (
              <p className="text-sm text-muted-foreground">
                Criada em {new Date(sale.createdAt).toLocaleDateString("pt-BR")}
                {sale.quoteId  ? ` · Orçamento #${sale.quoteId}`  : ""}
                {sale.orderId  ? ` · Pedido #${sale.orderId}`     : ""}
              </p>
            )}
          </div>
        </div>

        {/* ── ações ── */}
        <div className="flex gap-2">
          {/* Concluir */}
          {!isNew && sale?.status === "draft" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-green-600 border-green-300 hover:bg-green-50">
                  <CheckCircle className="mr-2 h-4 w-4" /> Concluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Concluir venda?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Após concluir, a venda não poderá mais ser editada.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={acting}
                    onClick={() => doAction("complete")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Concluir"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Cancelar */}
          {!isNew && sale?.status !== "cancelled" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                  <XCircle className="mr-2 h-4 w-4" /> Cancelar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar venda?</AlertDialogTitle>
                  <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={acting}
                    onClick={() => doAction("cancel")}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancelar Venda"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Imprimir */}
          {!isNew && (
            <Button variant="outline" onClick={() => nav(`/comercial/vendas/${numId}/print`)}>
              <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
          )}

          {/* Salvar */}
          {!isLocked && (
            <Button onClick={handleSave} disabled={saving}>
              {saving
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <Save className="mr-2 h-4 w-4" />}
              Salvar
            </Button>
          )}
        </div>
      </div>

      {/* ── tabs ── */}
      <Tabs defaultValue="geral">
        <TabsList>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="itens">Itens</TabsTrigger>
          <TabsTrigger value="entrega">Entrega</TabsTrigger>
          <TabsTrigger value="obs">Observações</TabsTrigger>
        </TabsList>

        {/* ABA GERAL */}
        <TabsContent value="geral" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <CustomerCombobox
                value={customerId}
                onChange={(id) => setCustomerId(id)}
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <Label>Vendedor</Label>
              <SellerCombobox
                value={sellerId}
                onChange={(id) => setSellerId(id)}
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <Label>Condição de Pagamento</Label>
              <Input value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                placeholder="Ex: 30 DDL" disabled={isLocked} />
            </div>
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Input value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                placeholder="Ex: Boleto" disabled={isLocked} />
            </div>
            <div className="space-y-2">
              <Label>Transportadora / Frete</Label>
              <Input value={transportMode}
                onChange={e => setTransportMode(e.target.value)}
                placeholder="Ex: Nosso carro" disabled={isLocked} />
            </div>
            <div className="space-y-2">
              <Label>Previsão de Entrega</Label>
              <Input type="date" value={expectedDel}
                onChange={e => setExpectedDel(e.target.value)}
                disabled={isLocked} />
            </div>
          </div>
        </TabsContent>

        {/* ABA ITENS */}
        <TabsContent value="itens" className="pt-4 space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto / Descrição</TableHead>
                <TableHead className="w-20 text-center">Un.</TableHead>
                <TableHead className="w-28 text-right">Qtd</TableHead>
                <TableHead className="w-32 text-right">Preço Unit.</TableHead>
                <TableHead className="w-32 text-right">Total</TableHead>
                {!isLocked && <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {draftItems.map(item => (
                <TableRow key={item._key}>
                  <TableCell>
                    <div className="space-y-1">
                      <ProductCombobox
                        value={item.productId}
                        onChange={(pid, name, price) => updateItem(item._key, {
                          productId:   pid,
                          description: name  ?? item.description,
                          unitPrice:   price ?? item.unitPrice,
                          priceText:   ptbrDecimal.format(price ?? item.unitPrice),
                        })}
                        disabled={isLocked}
                      />
                      <Input
                        placeholder="Descrição do item"
                        value={item.description}
                        onChange={e => updateItem(item._key, { description: e.target.value })}
                        disabled={isLocked}
                        className="text-sm"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      className="text-center w-16"
                      value={item.unit}
                      onChange={e => updateItem(item._key, { unit: e.target.value })}
                      disabled={isLocked}
                      placeholder="UN"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="text-right" inputMode="decimal"
                      value={item.qtyText} disabled={isLocked}
                      onChange={e => updateItem(item._key, { qtyText: ptbrDecimal.sanitize(e.target.value) })}
                      onBlur={() => {
                        const n = ptbrDecimal.parse(item.qtyText);
                        if (n !== null && n > 0)
                          updateItem(item._key, { quantity: n, qtyText: ptbrDecimal.format(n) });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="text-right" inputMode="decimal"
                      value={item.priceText} disabled={isLocked}
                      onChange={e => updateItem(item._key, { priceText: ptbrDecimal.sanitize(e.target.value) })}
                      onBlur={() => {
                        const n = ptbrDecimal.parse(item.priceText);
                        if (n !== null)
                          updateItem(item._key, { unitPrice: n, priceText: ptbrDecimal.format(n) });
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {(item.quantity * item.unitPrice).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </TableCell>
                  {!isLocked && (
                    <TableCell>
                      <Button size="icon" variant="ghost"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => removeItem(item._key)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!isLocked && (
            <Button variant="outline" onClick={() => setDraftItems(p => [...p, newItem()])}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
            </Button>
          )}

          {/* desconto + frete + totais */}
          <div className="flex justify-end gap-4 items-end">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Desconto (R$)</Label>
              <Input
                className="w-32 text-right" inputMode="decimal"
                value={discountText} disabled={isLocked}
                onChange={e => setDiscountText(ptbrDecimal.sanitize(e.target.value))}
                onBlur={() => {
                  const n = ptbrDecimal.parse(discountText);
                  if (n !== null) { setDiscount(n); setDiscountText(ptbrDecimal.format(n)); }
                }}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Frete (R$)</Label>
              <Input
                className="w-32 text-right" inputMode="decimal"
                value={freightText} disabled={isLocked}
                onChange={e => setFreightText(ptbrDecimal.sanitize(e.target.value))}
                onBlur={() => {
                  const n = ptbrDecimal.parse(freightText);
                  if (n !== null) { setFreight(n); setFreightText(ptbrDecimal.format(n)); }
                }}
              />
            </div>
            <TotalsCard subtotal={subtotal} discount={discount} freight={freight} total={total} />
          </div>
        </TabsContent>

        {/* ABA ENTREGA */}
        <TabsContent value="entrega" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input value={delZipcode} onChange={e => setDelZipcode(e.target.value)}
                placeholder="00000-000" disabled={isLocked} />
            </div>
            <div className="space-y-2">
              <Label>Logradouro</Label>
              <Input value={delStreet} onChange={e => setDelStreet(e.target.value)} disabled={isLocked} />
            </div>
            <div className="space-y-2">
              <Label>Número</Label>
              <Input value={delNumber} onChange={e => setDelNumber(e.target.value)} disabled={isLocked} />
            </div>
            <div className="space-y-2">
              <Label>Complemento</Label>
              <Input value={delComplement} onChange={e => setDelComplement(e.target.value)} disabled={isLocked} />
            </div>
            <div className="space-y-2">
              <Label>Bairro</Label>
              <Input value={delNeighborhood} onChange={e => setDelNeighborhood(e.target.value)} disabled={isLocked} />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input value={delCity} onChange={e => setDelCity(e.target.value)} disabled={isLocked} />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input value={delState} onChange={e => setDelState(e.target.value)}
                maxLength={2} placeholder="SP" disabled={isLocked} />
            </div>
          </div>
        </TabsContent>

        {/* ABA OBS */}
        <TabsContent value="obs" className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label>Observações (visível no documento)</Label>
            <Textarea rows={4}
              placeholder="Informações visíveis para o cliente..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              disabled={isLocked} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Notas Internas
              <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                não aparece no documento
              </span>
            </Label>
            <Textarea rows={4}
              placeholder="Anotações internas — não visíveis para o cliente..."
              value={internalNotes}
              onChange={e => setInternalNotes(e.target.value)}
              disabled={isLocked}
              className="border-amber-300 focus-visible:ring-amber-400" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
