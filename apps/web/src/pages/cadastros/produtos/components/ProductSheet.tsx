import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Product } from "../products.types";
import { type ProductUpsertForm, ProductUpsertSchema } from "../products.schema";
import { getProductStock } from "../products.service";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  mode: "create" | "edit";
  saving: boolean;

  initialData: Product | null;
  onSubmit: (data: ProductUpsertForm) => Promise<void> | void;
};

const empty: ProductUpsertForm = {
  name: "",
  sku: null,
  kind: "product",

  description: null,
  uom: "UN",

  ncm: null,
  ean: null,
  cest: null,
  fiscal_json: null,

  price: 0,
  cost: 0,

  track_inventory: true,
  active: true,

  image_url: null,

  weight_kg: null,
  width_cm: null,
  height_cm: null,
  length_cm: null,
};

/** Mantém só dígitos e vírgula (1 vírgula no máximo) */
function sanitizePtBrDecimalInput(raw: string) {
  let s = (raw ?? "").replace(/[^\d,]/g, "");
  const parts = s.split(",");
  if (parts.length > 2) s = `${parts[0]},${parts.slice(1).join("")}`;
  return s;
}

/**
 * Converte texto pt-BR para number.
 * - Aceita "10,5", "10,50", "1.234,56" (caso cole com ponto)
 * - Aceita "1," durante o blur (vira 1)
 */
function parsePtBrDecimal(raw: string): number | null {
  const s0 = (raw ?? "").trim();
  if (!s0) return null;

  const normalized = s0.replace(/\./g, "").replace(",", ".");
  const normalized2 = normalized.endsWith(".") ? normalized.slice(0, -1) : normalized;

  const n = Number(normalized2);
  return Number.isFinite(n) ? n : null;
}

function formatPtBrFixed(n: number, decimals = 2) {
  return Number(n).toFixed(decimals).replace(".", ",");
}

/** price/cost: vazio => 0 */
function parseMoneyTextOrZero(text: string) {
  const n = parsePtBrDecimal(text);
  return n === null ? 0 : n;
}

/** dimensões/peso: vazio => null */
function parseNullableNumberText(text: string) {
  const t = (text ?? "").trim();
  if (!t) return null;
  return parsePtBrDecimal(t);
}

export function ProductSheet({ open, onOpenChange, mode, saving, initialData, onSubmit }: Props) {
  const [tab, setTab] = React.useState("geral");
  const [form, setForm] = React.useState<ProductUpsertForm>(empty);

  const [stock, setStock] = React.useState<number | null>(null);
  const [stockLoading, setStockLoading] = React.useState(false);

  // Text states (permitem digitar vírgula sem “sumir”)
  const [priceText, setPriceText] = React.useState("0,00");
  const [costText, setCostText] = React.useState("0,00");

  const [weightText, setWeightText] = React.useState("");
  const [widthText, setWidthText] = React.useState("");
  const [heightText, setHeightText] = React.useState("");
  const [lengthText, setLengthText] = React.useState("");

  const kind = form.kind ?? "product";
  const trackDisabled = kind === "service";

  React.useEffect(() => {
    if (!open) return;

    setTab("geral");
    setStock(null);

    if (mode === "edit" && initialData) {
      const nextForm: ProductUpsertForm = {
        ...empty,
        name: initialData.name ?? "",
        sku: initialData.sku ?? null,
        kind: initialData.kind ?? "product",

        description: initialData.description ?? null,
        uom: initialData.uom ?? "UN",

        ncm: initialData.ncm ?? null,
        ean: initialData.ean ?? null,
        cest: initialData.cest ?? null,
        fiscal_json: initialData.fiscal_json ?? null,

        price: Number(initialData.price ?? 0),
        cost: Number(initialData.cost ?? 0),

        track_inventory: initialData.kind === "service" ? false : Boolean(initialData.track_inventory ?? true),
        active: Boolean(initialData.active ?? true),

        image_url: initialData.image_url ?? null,

        weight_kg: initialData.weight_kg ?? null,
        width_cm: initialData.width_cm ?? null,
        height_cm: initialData.height_cm ?? null,
        length_cm: initialData.length_cm ?? null,
      };

      setForm(nextForm);

      setPriceText(formatPtBrFixed(Number(nextForm.price ?? 0), 2));
      setCostText(formatPtBrFixed(Number(nextForm.cost ?? 0), 2));

      setWeightText(nextForm.weight_kg === null ? "" : formatPtBrFixed(Number(nextForm.weight_kg), 3));
      setWidthText(nextForm.width_cm === null ? "" : formatPtBrFixed(Number(nextForm.width_cm), 2));
      setHeightText(nextForm.height_cm === null ? "" : formatPtBrFixed(Number(nextForm.height_cm), 2));
      setLengthText(nextForm.length_cm === null ? "" : formatPtBrFixed(Number(nextForm.length_cm), 2));

      void loadStock(initialData.id);
      return;
    }

    setForm(empty);

    setPriceText(formatPtBrFixed(0, 2));
    setCostText(formatPtBrFixed(0, 2));

    setWeightText("");
    setWidthText("");
    setHeightText("");
    setLengthText("");
  }, [open, mode, initialData]);

  async function loadStock(productId: number) {
    setStockLoading(true);
    try {
      const r = await getProductStock(productId);
      setStock(Number(r?.stock ?? 0));
    } catch {
      setStock(null);
    } finally {
      setStockLoading(false);
    }
  }

  function set<K extends keyof ProductUpsertForm>(key: K, value: ProductUpsertForm[K]) {
    setForm((p) => {
      const next = { ...p, [key]: value };

      // regra: service => track_inventory false (UI + backend)
      if (key === "kind" && value === "service") next.track_inventory = false;

      return next;
    });
  }

  async function handleSubmit() {
    // Converte textos -> números (mesmo se o usuário não deu blur)
    const price = parseMoneyTextOrZero(priceText);
    const cost = parseMoneyTextOrZero(costText);

    const weight_kg = parseNullableNumberText(weightText);
    const width_cm = parseNullableNumberText(widthText);
    const height_cm = parseNullableNumberText(heightText);
    const length_cm = parseNullableNumberText(lengthText);

    if (price < 0 || cost < 0) return toast.error("Preço/custo inválido");
    if ([weight_kg, width_cm, height_cm, length_cm].some((n) => n !== null && (n as number) < 0)) {
      return toast.error("Dimensões/peso inválidos");
    }

    const effective: ProductUpsertForm = {
      ...form,
      price,
      cost,
      weight_kg,
      width_cm,
      height_cm,
      length_cm,
    };

    const parsed = ProductUpsertSchema.safeParse(effective);
    if (!parsed.success) {
      toast.error(parsed.error.issues?.[0]?.message ?? "Validação falhou");
      return;
    }

    const payload = {
      ...parsed.data,
      track_inventory: parsed.data.kind === "service" ? false : Boolean(parsed.data.track_inventory ?? true),
    };

    await onSubmit(payload);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[920px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Novo produto" : `Editar produto #${initialData?.id ?? ""}`}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-6">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="comercial">Comercial</TabsTrigger>
              <TabsTrigger value="estoque">Estoque</TabsTrigger>
              <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
              <TabsTrigger value="logistica">Logística</TabsTrigger>
              <TabsTrigger value="midia">Mídia</TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-2">
                  <Label>Nome</Label>
                  <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.kind} onValueChange={(v) => set("kind", v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Produto</SelectItem>
                      <SelectItem value="service">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input value={form.sku ?? ""} onChange={(e) => set("sku", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Unidade (UOM)</Label>
                  <Input
                    value={form.uom ?? ""}
                    onChange={(e) => set("uom", e.target.value)}
                    placeholder="UN, KG, CX..."
                  />
                </div>

                <div className="flex items-center justify-between border rounded-lg p-3 md:col-span-1">
                  <div>
                    <div className="font-medium">Ativo</div>
                    <div className="text-sm text-muted-foreground">Disponível para venda/uso</div>
                  </div>
                  <Switch checked={Boolean(form.active ?? true)} onCheckedChange={(v) => set("active", v)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  rows={4}
                  value={form.description ?? ""}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Descrição comercial para aparecer no orçamento/pedido..."
                />
              </div>
            </TabsContent>

            <TabsContent value="comercial" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Preço de venda</Label>
                  <Input
                    inputMode="decimal"
                    value={priceText}
                    onChange={(e) => setPriceText(sanitizePtBrDecimalInput(e.target.value))}
                    onBlur={() => {
                      const n = parsePtBrDecimal(priceText);
                      if (n === null) return toast.error("Preço inválido");
                      set("price", n);
                      setPriceText(formatPtBrFixed(n, 2));
                    }}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Custo</Label>
                  <Input
                    inputMode="decimal"
                    value={costText}
                    onChange={(e) => setCostText(sanitizePtBrDecimalInput(e.target.value))}
                    onBlur={() => {
                      const n = parsePtBrDecimal(costText);
                      if (n === null) return toast.error("Custo inválido");
                      set("cost", n);
                      setCostText(formatPtBrFixed(n, 2));
                    }}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="estoque" className="mt-4 space-y-4">
              <div className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <div className="font-medium">Controlar estoque</div>
                  <div className="text-sm text-muted-foreground">
                    Serviços não controlam estoque (regra automática).
                  </div>

                  {mode === "edit" ? (
                    <div className="text-sm mt-2">
                      Saldo atual:{" "}
                      <span className="font-mono tabular-nums">
                        {stockLoading ? "..." : stock === null ? "—" : stock}
                      </span>
                    </div>
                  ) : null}
                </div>

                <Switch
                  checked={Boolean(form.track_inventory)}
                  onCheckedChange={(v) => set("track_inventory", v)}
                  disabled={trackDisabled}
                />
              </div>
            </TabsContent>

            <TabsContent value="fiscal" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>NCM</Label>
                  <Input value={form.ncm ?? ""} onChange={(e) => set("ncm", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>EAN</Label>
                  <Input value={form.ean ?? ""} onChange={(e) => set("ean", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>CEST</Label>
                  <Input value={form.cest ?? ""} onChange={(e) => set("cest", e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fiscal JSON (opcional)</Label>
                <Textarea
                  rows={6}
                  value={form.fiscal_json ?? ""}
                  onChange={(e) => set("fiscal_json", e.target.value)}
                  placeholder='{"origem":"0","cst":"00","icms":...}'
                />
              </div>
            </TabsContent>

            <TabsContent value="logistica" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label>Peso (kg)</Label>
                  <Input
                    inputMode="decimal"
                    value={weightText}
                    onChange={(e) => setWeightText(sanitizePtBrDecimalInput(e.target.value))}
                    onBlur={() => {
                      const n = parseNullableNumberText(weightText);
                      if (weightText.trim() !== "" && n === null) return toast.error("Peso inválido");
                      set("weight_kg", n);
                      setWeightText(n === null ? "" : formatPtBrFixed(n, 3));
                    }}
                    placeholder="Ex.: 1,250"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Largura (cm)</Label>
                  <Input
                    inputMode="decimal"
                    value={widthText}
                    onChange={(e) => setWidthText(sanitizePtBrDecimalInput(e.target.value))}
                    onBlur={() => {
                      const n = parseNullableNumberText(widthText);
                      if (widthText.trim() !== "" && n === null) return toast.error("Largura inválida");
                      set("width_cm", n);
                      setWidthText(n === null ? "" : formatPtBrFixed(n, 2));
                    }}
                    placeholder="Ex.: 10,50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Altura (cm)</Label>
                  <Input
                    inputMode="decimal"
                    value={heightText}
                    onChange={(e) => setHeightText(sanitizePtBrDecimalInput(e.target.value))}
                    onBlur={() => {
                      const n = parseNullableNumberText(heightText);
                      if (heightText.trim() !== "" && n === null) return toast.error("Altura inválida");
                      set("height_cm", n);
                      setHeightText(n === null ? "" : formatPtBrFixed(n, 2));
                    }}
                    placeholder="Ex.: 20,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Comprimento (cm)</Label>
                  <Input
                    inputMode="decimal"
                    value={lengthText}
                    onChange={(e) => setLengthText(sanitizePtBrDecimalInput(e.target.value))}
                    onBlur={() => {
                      const n = parseNullableNumberText(lengthText);
                      if (lengthText.trim() !== "" && n === null) return toast.error("Comprimento inválido");
                      set("length_cm", n);
                      setLengthText(n === null ? "" : formatPtBrFixed(n, 2));
                    }}
                    placeholder="Ex.: 30,00"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="midia" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Imagem (URL)</Label>
                <Input
                  value={form.image_url ?? ""}
                  onChange={(e) => set("image_url", e.target.value)}
                  placeholder="https://..."
                />
              </div>

              {form.image_url ? (
                <div className="border rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-2">Prévia</div>
                  <img
                    src={form.image_url}
                    alt="Prévia"
                    className="max-h-[220px] rounded-md object-contain bg-muted w-full"
                    onError={() => {}}
                  />
                </div>
              ) : null}
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
