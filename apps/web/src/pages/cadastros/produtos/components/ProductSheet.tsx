import * as React from "react";
import { toast } from "sonner";

import { useFiscalNcm } from "@/pages/cadastros/fiscal/useFiscalNcm";
import { useFiscalCest } from "@/pages/cadastros/fiscal/useFiscalCest";
import { useFiscalUom } from "@/pages/cadastros/fiscal/useFiscalUom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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

import type { Product, ProductKind } from "../products.types";
import {
  type ProductUpsertForm,
  ProductUpsertSchema,
} from "../products.schema";
import { getProductStock } from "../products.service";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  saving: boolean;
  initialData: Product | null;
  onSubmit: (data: ProductUpsertForm) => Promise<any> | void;
};

const empty: ProductUpsertForm = {
  name: "",
  sku: null,
  kind: "product",
  description: null,
  uom: "UN",
  uom_id: null,
  ncm: null,
  ncm_id: null,
  ean: null,
  cest: null,
  cest_id: null,
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
 * - Aceita "10,5", "10,50", "1.234,56"
 * - Aceita "1," durante o blur (vira 1)
 */
function parsePtBrDecimal(raw: string): number | null {
  const s0 = (raw ?? "").trim();
  if (!s0) return null;
  const normalized = s0.replace(/\./g, "").replace(",", ".");
  const normalized2 = normalized.endsWith(".")
    ? normalized.slice(0, -1)
    : normalized;
  const n = Number(normalized2);
  return Number.isFinite(n) ? n : null;
}

function formatPtBrFixed(n: number, decimals = 2) {
  return Number(n).toFixed(decimals).replace(".", ",");
}

function parseMoneyTextOrZero(text: string) {
  const n = parsePtBrDecimal(text);
  return n === null ? 0 : n;
}

function parseNullableNumberText(text: string) {
  const t = (text ?? "").trim();
  if (!t) return null;
  return parsePtBrDecimal(t);
}

function kindLabel(kind: ProductKind) {
  switch (kind) {
    case "service":
      return "Serviço";
    case "consumable":
      return "Consumível";
    case "kit":
      return "Kit";
    default:
      return "Produto";
  }
}

export function ProductSheet({
  open,
  onOpenChange,
  mode,
  saving,
  initialData,
  onSubmit,
}: Props) {
  const [tab, setTab] = React.useState("geral");
  const [form, setForm] = React.useState<ProductUpsertForm>(empty);
  const [stock, setStock] = React.useState<number | null>(null);
  const [stockLoading, setStockLoading] = React.useState(false);

  // Text states para manter vírgula pt-BR
  const [priceText, setPriceText] = React.useState("0,00");
  const [costText, setCostText] = React.useState("0,00");
  const [weightText, setWeightText] = React.useState("");
  const [widthText, setWidthText] = React.useState("");
  const [heightText, setHeightText] = React.useState("");
  const [lengthText, setLengthText] = React.useState("");

  const kind = form.kind ?? "product";
  const isService = kind === "service";
  const isConsumable = kind === "consumable";
  const isKit = kind === "kit";
  const requiresNcm = kind === "product" || isConsumable;
  const inventoryForcedOff = isService || isKit;
  const showLogistics = kind !== "service";
  const showFiscal = requiresNcm;

  const cest = useFiscalCest();
  const [cestSearch, setCestSearch] = React.useState("");
  const [cestOpen, setCestOpen] = React.useState(false);

  const uom = useFiscalUom();
  const [uomSearch, setUomSearch] = React.useState("");
  const [uomOpen, setUomOpen] = React.useState(false);

  const ncm = useFiscalNcm();
  const [ncmSearch, setNcmSearch] = React.useState("");
  const [ncmOpen, setNcmOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;

    setTab("geral");
    setStock(null);

    if (mode === "edit" && initialData) {
      const nextKind = (initialData.kind ?? "product") as ProductKind;

      const nextForm: ProductUpsertForm = {
        ...empty,
        name: initialData.name ?? "",
        sku: initialData.sku ?? null,
        kind: nextKind,
        description: initialData.description ?? null,
        uom: initialData.uom ?? "UN",
        uom_id: (initialData as any).uom_id ?? null,
        ncm: initialData.ncm ?? null,
        ncm_id: (initialData as any).ncm_id ?? null,
        ean: initialData.ean ?? null,
        cest: initialData.cest ?? null,
        cest_id: (initialData as any).cest_id ?? null,
        fiscal_json: initialData.fiscal_json ?? null,
        price: Number(initialData.price ?? 0),
        cost: Number(initialData.cost ?? 0),
        track_inventory:
          nextKind === "service" || nextKind === "kit"
            ? false
            : nextKind === "consumable"
              ? Boolean(initialData.track_inventory ?? false)
              : Boolean(initialData.track_inventory ?? true),
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

      setWeightText(
        nextForm.weight_kg === null
          ? ""
          : formatPtBrFixed(Number(nextForm.weight_kg), 3),
      );
      setWidthText(
        nextForm.width_cm === null
          ? ""
          : formatPtBrFixed(Number(nextForm.width_cm), 2),
      );
      setHeightText(
        nextForm.height_cm === null
          ? ""
          : formatPtBrFixed(Number(nextForm.height_cm), 2),
      );
      setLengthText(
        nextForm.length_cm === null
          ? ""
          : formatPtBrFixed(Number(nextForm.length_cm), 2),
      );

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

  React.useEffect(() => {
    if (inventoryForcedOff) {
      setForm((p) => ({
        ...p,
        track_inventory: false,
        ncm: null,
        ncm_id: null,
        cest: null,
        cest_id: null,
      }));
      setNcmSearch("");
      setCestSearch("");
    }
  }, [inventoryForcedOff]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      ncm.setQuery((q) => ({
        ...q,
        page: 1,
        search: ncmSearch || undefined,
        active: "1",
      }));
    }, 300);
    return () => clearTimeout(t);
  }, [ncmSearch, ncm]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      cest.setQuery((q) => ({
        ...q,
        page: 1,
        search: cestSearch || undefined,
        active: "1",
      }));
    }, 300);
    return () => clearTimeout(t);
  }, [cestSearch, cest]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      uom.setQuery((q) => ({
        ...q,
        page: 1,
        search: uomSearch || undefined,
        active: "1",
      }));
    }, 200);
    return () => clearTimeout(t);
  }, [uomSearch, uom]);

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

  function set<K extends keyof ProductUpsertForm>(
    key: K,
    value: ProductUpsertForm[K],
  ) {
    setForm((p) => {
      const next = { ...p, [key]: value };

      if (key === "kind") {
        const nextKind = value as ProductKind;

        if (nextKind === "service" || nextKind === "kit") {
          next.track_inventory = false;
          next.ncm = null;
          next.ncm_id = null;
          next.cest = null;
          next.cest_id = null;
        }

        if (nextKind === "consumable" && typeof next.track_inventory !== "boolean") {
          next.track_inventory = false;
        }

        if (nextKind === "product" && typeof next.track_inventory !== "boolean") {
          next.track_inventory = true;
        }
      }

      return next;
    });
  }

  async function handleSubmit() {
    const price = parseMoneyTextOrZero(priceText);
    const cost = parseMoneyTextOrZero(costText);

    const weight_kg = parseNullableNumberText(weightText);
    const width_cm = parseNullableNumberText(widthText);
    const height_cm = parseNullableNumberText(heightText);
    const length_cm = parseNullableNumberText(lengthText);

    if (price < 0 || cost < 0) {
      return toast.error("Preço/custo inválido");
    }

    if (
      [weight_kg, width_cm, height_cm, length_cm].some(
        (n) => n !== null && (n as number) < 0,
      )
    ) {
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
      toast.error(
        parsed.error.issues?.[0]?.message ?? "Validação falhou",
      );
      return;
    }

    const kind = parsed.data.kind ?? "product";

    const payload: ProductUpsertForm = {
      ...parsed.data,
      track_inventory:
        kind === "service" || kind === "kit"
          ? false
          : kind === "consumable"
            ? Boolean(parsed.data.track_inventory ?? false)
            : Boolean(parsed.data.track_inventory ?? true),
      ncm: requiresNcm ? parsed.data.ncm ?? null : null,
      ncm_id: requiresNcm ? parsed.data.ncm_id ?? null : null,
      cest: requiresNcm ? parsed.data.cest ?? null : null,
      cest_id: requiresNcm ? parsed.data.cest_id ?? null : null,
    };

    await onSubmit(payload);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-5xl">
        <SheetHeader>
          <SheetTitle>
            {mode === "create"
              ? "Novo item"
              : `Editar item #${initialData?.id ?? ""}`}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="comercial">Comercial</TabsTrigger>
              <TabsTrigger value="estoque">Estoque</TabsTrigger>
              <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
              <TabsTrigger value="logistica">Logística</TabsTrigger>
              <TabsTrigger value="midia">Mídia</TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={form.name ?? ""}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={form.kind ?? "product"}
                    onValueChange={(v) => set("kind", v as ProductKind)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Produto</SelectItem>
                      <SelectItem value="service">Serviço</SelectItem>
                      <SelectItem value="consumable">Consumível</SelectItem>
                      <SelectItem value="kit">Kit</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Tipo atual: {kindLabel(form.kind ?? "product")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input
                    value={form.sku ?? ""}
                    onChange={(e) => set("sku", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Unidade (UOM)</Label>
                  <Input
                    value={form.uom ?? ""}
                    onFocus={() => setUomOpen(true)}
                    onChange={(e) => {
                      const v = e.target.value;
                      set("uom_id", null);
                      set("uom", v);
                      setUomSearch(v);
                      setUomOpen(true);
                    }}
                    placeholder="Digite para buscar (UN, KG, CX...)"
                  />

                  {uomOpen ? (
                    <div className="rounded-lg border bg-background p-2">
                      <div className="mb-2 text-xs text-muted-foreground">
                        {uom.loading
                          ? "Buscando..."
                          : `Resultados: ${uom.data?.items?.length ?? 0}`}
                      </div>

                      <div className="max-h-48 space-y-1 overflow-auto">
                        {(uom.data?.items ?? []).map((it) => (
                          <button
                            type="button"
                            key={it.id}
                            className="block w-full rounded-md px-2 py-2 text-left hover:bg-muted"
                            onClick={() => {
                              set("uom_id", Number(it.id));
                              set("uom", String(it.code));
                              setUomOpen(false);
                            }}
                          >
                            <div className="font-medium">{it.code}</div>
                            <div className="text-xs text-muted-foreground">
                              {it.description}
                            </div>
                          </button>
                        ))}

                        {!uom.loading &&
                        (uom.data?.items?.length ?? 0) === 0 ? (
                          <div className="text-xs text-muted-foreground">
                            Nenhuma UOM encontrada.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-3 rounded-lg border p-3 md:col-span-2">
                  <Switch
                    checked={Boolean(form.active ?? true)}
                    onCheckedChange={(v) => set("active", v)}
                  />
                  <Label>Ativo</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comercial" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Preço</Label>
                  <Input
                    inputMode="decimal"
                    value={priceText}
                    onChange={(e) =>
                      setPriceText(
                        sanitizePtBrDecimalInput(e.target.value),
                      )
                    }
                    onBlur={() =>
                      setPriceText(
                        formatPtBrFixed(
                          parseMoneyTextOrZero(priceText),
                          2,
                        ),
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Custo</Label>
                  <Input
                    inputMode="decimal"
                    value={costText}
                    onChange={(e) =>
                      setCostText(
                        sanitizePtBrDecimalInput(e.target.value),
                      )
                    }
                    onBlur={() =>
                      setCostText(
                        formatPtBrFixed(
                          parseMoneyTextOrZero(costText),
                          2,
                        ),
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>EAN</Label>
                  <Input
                    value={form.ean ?? ""}
                    onChange={(e) => set("ean", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={form.description ?? ""}
                    onChange={(e) =>
                      set("description", e.target.value)
                    }
                    className="min-h-[92px]"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="estoque" className="space-y-4 pt-4">
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">Controle de estoque</div>
                    <div className="text-sm text-muted-foreground">
                      {inventoryForcedOff
                        ? "Este tipo de item não controla estoque nesta fase."
                        : "Defina se o item participa do saldo de estoque."}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={Boolean(form.track_inventory)}
                      disabled={inventoryForcedOff}
                      onCheckedChange={(v) =>
                        set("track_inventory", v)
                      }
                    />
                    <Label>Controlar estoque</Label>
                  </div>
                </div>

                {mode === "edit" ? (
                  <div className="text-sm text-muted-foreground">
                    Saldo atual:{" "}
                    {stockLoading
                      ? "carregando..."
                      : stock === null
                        ? "indisponível"
                        : stock}
                  </div>
                ) : null}
              </div>
            </TabsContent>

            <TabsContent value="fiscal" className="space-y-4 pt-4">
              {!showFiscal ? (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  O tipo <strong>{kindLabel(kind)}</strong> não exige NCM nesta
                  fase.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>NCM</Label>
                    <Input
                      value={form.ncm ?? ""}
                      onFocus={() => setNcmOpen(true)}
                      onChange={(e) => {
                        const v = e.target.value;
                        set("ncm_id", null);
                        set("ncm", v);
                        setNcmSearch(v);
                        setNcmOpen(true);
                      }}
                      placeholder="Digite para buscar NCM"
                    />

                    {ncmOpen ? (
                      <div className="rounded-lg border bg-background p-2">
                        <div className="mb-2 text-xs text-muted-foreground">
                          {ncm.loading
                            ? "Buscando..."
                            : `Resultados: ${ncm.data?.items?.length ?? 0}`}
                        </div>

                        <div className="max-h-56 space-y-1 overflow-auto">
                          {(ncm.data?.items ?? []).map((it) => (
                            <button
                              type="button"
                              key={it.id}
                              className="block w-full rounded-md px-2 py-2 text-left hover:bg-muted"
                              onClick={() => {
                                set("ncm_id", Number(it.id));
                                set("ncm", String(it.code));
                                setNcmOpen(false);
                              }}
                            >
                              <div className="font-medium">{it.code}</div>
                              <div className="text-xs text-muted-foreground">
                                {it.description}
                              </div>
                            </button>
                          ))}

                          {!ncm.loading &&
                          (ncm.data?.items?.length ?? 0) === 0 ? (
                            <div className="text-xs text-muted-foreground">
                              Nenhum NCM encontrado.
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label>CEST</Label>
                    <Input
                      value={form.cest ?? ""}
                      onFocus={() => setCestOpen(true)}
                      onChange={(e) => {
                        const v = e.target.value;
                        set("cest_id", null);
                        set("cest", v);
                        setCestSearch(v);
                        setCestOpen(true);
                      }}
                      placeholder="Digite para buscar CEST"
                    />

                    {cestOpen ? (
                      <div className="rounded-lg border bg-background p-2">
                        <div className="mb-2 text-xs text-muted-foreground">
                          {cest.loading
                            ? "Buscando..."
                            : `Resultados: ${cest.data?.items?.length ?? 0}`}
                        </div>

                        <div className="max-h-56 space-y-1 overflow-auto">
                          {(cest.data?.items ?? []).map((it) => (
                            <button
                              type="button"
                              key={it.id}
                              className="block w-full rounded-md px-2 py-2 text-left hover:bg-muted"
                              onClick={() => {
                                set("cest_id", Number(it.id));
                                set("cest", String(it.code));
                                setCestOpen(false);
                              }}
                            >
                              <div className="font-medium">{it.code}</div>
                              <div className="text-xs text-muted-foreground">
                                {it.description}
                              </div>
                            </button>
                          ))}

                          {!cest.loading &&
                          (cest.data?.items?.length ?? 0) === 0 ? (
                            <div className="text-xs text-muted-foreground">
                              Nenhum CEST encontrado.
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="logistica" className="space-y-4 pt-4">
              {!showLogistics ? (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  Serviços não utilizam dados logísticos nesta fase.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Peso (kg)</Label>
                    <Input
                      inputMode="decimal"
                      value={weightText}
                      onChange={(e) =>
                        setWeightText(
                          sanitizePtBrDecimalInput(e.target.value),
                        )
                      }
                      onBlur={() => {
                        const parsed = parseNullableNumberText(weightText);
                        setWeightText(
                          parsed === null
                            ? ""
                            : formatPtBrFixed(parsed, 3),
                        );
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Largura (cm)</Label>
                    <Input
                      inputMode="decimal"
                      value={widthText}
                      onChange={(e) =>
                        setWidthText(
                          sanitizePtBrDecimalInput(e.target.value),
                        )
                      }
                      onBlur={() => {
                        const parsed = parseNullableNumberText(widthText);
                        setWidthText(
                          parsed === null
                            ? ""
                            : formatPtBrFixed(parsed, 2),
                        );
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Altura (cm)</Label>
                    <Input
                      inputMode="decimal"
                      value={heightText}
                      onChange={(e) =>
                        setHeightText(
                          sanitizePtBrDecimalInput(e.target.value),
                        )
                      }
                      onBlur={() => {
                        const parsed = parseNullableNumberText(heightText);
                        setHeightText(
                          parsed === null
                            ? ""
                            : formatPtBrFixed(parsed, 2),
                        );
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Comprimento (cm)</Label>
                    <Input
                      inputMode="decimal"
                      value={lengthText}
                      onChange={(e) =>
                        setLengthText(
                          sanitizePtBrDecimalInput(e.target.value),
                        )
                      }
                      onBlur={() => {
                        const parsed = parseNullableNumberText(lengthText);
                        setLengthText(
                          parsed === null
                            ? ""
                            : formatPtBrFixed(parsed, 2),
                        );
                      }}
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="midia" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>URL da imagem</Label>
                <Input
                  value={form.image_url ?? ""}
                  onChange={(e) => set("image_url", e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>

          <Button type="button" onClick={handleSubmit} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}