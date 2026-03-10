import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import type {
  ProductKitDetails,
  ProductKitUpsertPayload,
} from "../product-kits.types";
import { ProductKitUpsertSchema } from "../product-kits.schema";
import { listProducts } from "@/pages/cadastros/produtos/products.service";
import type { Product } from "@/pages/cadastros/produtos/products.types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  saving: boolean;
  initialData: ProductKitDetails | null;
  onSubmit: (data: ProductKitUpsertPayload) => Promise<any> | void;
};

type Row = {
  componentProductId: number;
  quantity: number;
  sortOrder: number;
};

export function ProductKitSheet({
  open,
  onOpenChange,
  saving,
  initialData,
  onSubmit,
}: Props) {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [options, setOptions] = React.useState<Product[]>([]);
  const [loadingOptions, setLoadingOptions] = React.useState(false);

  React.useEffect(() => {
    if (!open || !initialData) return;

    setRows(
      (initialData.items ?? []).map((x) => ({
        componentProductId: x.component_product_id,
        quantity: Number(x.quantity),
        sortOrder: x.sort_order,
      })),
    );
  }, [open, initialData]);

    React.useEffect(() => {
    if (!open) return;

    void (async () => {
        setLoadingOptions(true);

        try {
        const response = await listProducts({
            limit: 100,
            active: 1,
        });

        const items = Array.isArray(response)
            ? response
            : (response as any)?.items ?? [];

        setOptions(
            items.filter(
            (x: any) =>
                ["product", "consumable"].includes(x.kind) &&
                x.id !== initialData?.id,
            ),
        );
        } catch (e: any) {
        console.error("Falha ao carregar componentes do kit", e);
        toast.error(
            e?.message ?? "Falha ao carregar componentes do kit",
        );
        setOptions([]);
        } finally {
        setLoadingOptions(false);
        }
    })();
    }, [open, initialData?.id]);

  function addRow() {
    setRows((prev) => [
      ...prev,
      { componentProductId: 0, quantity: 1, sortOrder: prev.length * 10 + 10 },
    ]);
  }

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!initialData) return;

    const payload: ProductKitUpsertPayload = {
      kitProductId: initialData.id,
      items: rows,
    };

    const parsed = ProductKitUpsertSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues?.[0]?.message ?? "Validação falhou");
      return;
    }

    await onSubmit(parsed.data);
  }

  if (!initialData) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-4xl">
        <SheetHeader>
          <SheetTitle>
            Composição do kit: {initialData.name}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            SKU: {initialData.sku ?? "—"}
          </div>

          <div className="space-y-3">
            {rows.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-3 rounded-lg border p-3 md:grid-cols-12"
              >
                <div className="md:col-span-6">
                  <label className="mb-1 block text-sm font-medium">
                    Componente
                  </label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={row.componentProductId || ""}
                    onChange={(e) =>
                      updateRow(index, {
                        componentProductId: Number(e.target.value),
                      })
                    }
                  >
                    <option value="">Selecione...</option>
                    {options.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name} {opt.sku ? `(${opt.sku})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">
                    Quantidade
                  </label>
                  <Input
                    type="number"
                    min="0.0001"
                    step="0.0001"
                    value={row.quantity}
                    onChange={(e) =>
                      updateRow(index, {
                        quantity: Number(e.target.value || 0),
                      })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">
                    Ordem
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={row.sortOrder}
                    onChange={(e) =>
                      updateRow(index, {
                        sortOrder: Number(e.target.value || 0),
                      })
                    }
                  />
                </div>

                <div className="flex items-end md:col-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => removeRow(index)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={addRow}
              disabled={loadingOptions}
            >
              Adicionar componente
            </Button>
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
            {saving ? "Salvando..." : "Salvar composição"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}