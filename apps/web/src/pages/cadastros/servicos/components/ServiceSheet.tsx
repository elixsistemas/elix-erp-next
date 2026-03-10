import * as React from "react";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import type { Service } from "../services.types";
import {
  type ServiceUpsertForm,
  ServiceUpsertSchema,
} from "../services.schema";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  saving: boolean;
  initialData: Service | null;
  onSubmit: (data: ServiceUpsertForm) => Promise<any> | void;
};

const empty: ServiceUpsertForm = {
  name: "",
  sku: null,
  description: null,
  uom: "UN",
  uom_id: null,
  price: 0,
  cost: 0,
  active: true,
  image_url: null,
};

function sanitizePtBrDecimalInput(raw: string) {
  let s = (raw ?? "").replace(/[^\d,]/g, "");
  const parts = s.split(",");
  if (parts.length > 2) s = `${parts[0]},${parts.slice(1).join("")}`;
  return s;
}

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

export function ServiceSheet({
  open,
  onOpenChange,
  mode,
  saving,
  initialData,
  onSubmit,
}: Props) {
  const [form, setForm] = React.useState<ServiceUpsertForm>(empty);

  const [priceText, setPriceText] = React.useState("0,00");
  const [costText, setCostText] = React.useState("0,00");

  const uom = useFiscalUom();
  const [uomSearch, setUomSearch] = React.useState("");
  const [uomOpen, setUomOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialData) {
      const nextForm: ServiceUpsertForm = {
        ...empty,
        name: initialData.name ?? "",
        sku: initialData.sku ?? null,
        description: initialData.description ?? null,
        uom: initialData.uom ?? "UN",
        uom_id: (initialData as any).uom_id ?? null,
        price: Number(initialData.price ?? 0),
        cost: Number(initialData.cost ?? 0),
        active: Boolean(initialData.active ?? true),
        image_url: initialData.image_url ?? null,
      };

      setForm(nextForm);
      setPriceText(formatPtBrFixed(Number(nextForm.price ?? 0), 2));
      setCostText(formatPtBrFixed(Number(nextForm.cost ?? 0), 2));
      return;
    }

    setForm(empty);
    setPriceText("0,00");
    setCostText("0,00");
  }, [open, mode, initialData]);

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

  function set<K extends keyof ServiceUpsertForm>(
    key: K,
    value: ServiceUpsertForm[K],
  ) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit() {
    const price = parseMoneyTextOrZero(priceText);
    const cost = parseMoneyTextOrZero(costText);

    if (price < 0 || cost < 0) {
      return toast.error("Preço/custo inválido");
    }

    const effective: ServiceUpsertForm = {
      ...form,
      price,
      cost,
    };

    const parsed = ServiceUpsertSchema.safeParse(effective);

    if (!parsed.success) {
      toast.error(
        parsed.error.issues?.[0]?.message ?? "Validação falhou",
      );
      return;
    }

    await onSubmit(parsed.data);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>
            {mode === "create"
              ? "Novo serviço"
              : `Editar serviço #${initialData?.id ?? ""}`}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Serviços usam o catálogo unificado de itens com <strong>kind =
            service</strong>, sem estoque, NCM, CEST ou logística.
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={form.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>SKU</Label>
              <Input
                value={form.sku ?? ""}
                onChange={(e) => set("sku", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Preço</Label>
              <Input
                inputMode="decimal"
                value={priceText}
                onChange={(e) =>
                  setPriceText(sanitizePtBrDecimalInput(e.target.value))
                }
                onBlur={() =>
                  setPriceText(
                    formatPtBrFixed(parseMoneyTextOrZero(priceText), 2),
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
                  setCostText(sanitizePtBrDecimalInput(e.target.value))
                }
                onBlur={() =>
                  setCostText(
                    formatPtBrFixed(parseMoneyTextOrZero(costText), 2),
                  )
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Descrição</Label>
              <Textarea
                value={form.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                className="min-h-[100px]"
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
                placeholder="Digite para buscar (UN, H, SV...)"
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

            <div className="space-y-2">
              <Label>URL da imagem</Label>
              <Input
                value={form.image_url ?? ""}
                onChange={(e) => set("image_url", e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-3 md:col-span-2">
              <Switch
                checked={Boolean(form.active ?? true)}
                onCheckedChange={(v) => set("active", v)}
              />
              <Label>Ativo</Label>
            </div>
          </div>
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