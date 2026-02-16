import * as React from "react";
import type { Product } from "../products.types";
import type { ProductFormValues } from "../products.schema";
import { ProductFormSchema } from "../products.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial: Product | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void | Promise<void>;
};

export function ProductsDialog({ open, mode, initial, saving, onClose, onSubmit }: Props) {
  const [values, setValues] = React.useState<ProductFormValues>({
    name: "",
    sku: null,
    ncm: null,
    ean: null,
    price: 0,
    cost: 0,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setValues({
        name: initial.name ?? "",
        sku: initial.sku ?? null,
        ncm: initial.ncm ?? null,
        ean: initial.ean ?? null,
        price: initial.price ?? 0,
        cost: initial.cost ?? 0,
      });
    } else {
      setValues({ name: "", sku: null, ncm: null, ean: null, price: 0, cost: 0 });
    }

    setErrors({});
  }, [open, mode, initial]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = ProductFormSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0] ?? "form");
        if (!next[k]) next[k] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    await onSubmit(parsed.data);
  }

  const title = mode === "create" ? "Novo produto" : "Editar produto";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-background border shadow-lg">
        <div className="p-4 border-b">
          <div className="text-lg font-semibold">{title}</div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-sm">Nome *</label>
            <Input
              value={values.name}
              onChange={(e) => setValues((s) => ({ ...s, name: e.target.value }))}
              placeholder="Ex: Produto X"
            />
            {errors.name ? <div className="text-xs text-destructive">{errors.name}</div> : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-sm">SKU</label>
              <Input
                value={values.sku ?? ""}
                onChange={(e) => setValues((s) => ({ ...s, sku: e.target.value || null }))}
                placeholder="Ex: SKU-123"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm">NCM</label>
              <Input
                value={values.ncm ?? ""}
                onChange={(e) => setValues((s) => ({ ...s, ncm: e.target.value || null }))}
                placeholder="Ex: 1234.56.78"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm">EAN</label>
              <Input
                value={values.ean ?? ""}
                onChange={(e) => setValues((s) => ({ ...s, ean: e.target.value || null }))}
                placeholder="Código de barras"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm">Preço</label>
              <Input
                type="number"
                step="0.01"
                value={String(values.price ?? 0)}
                onChange={(e) => setValues((s) => ({ ...s, price: Number(e.target.value) }))}
              />
              {errors.price ? <div className="text-xs text-destructive">{errors.price}</div> : null}
            </div>

            <div className="space-y-1">
              <label className="text-sm">Custo</label>
              <Input
                type="number"
                step="0.01"
                value={String(values.cost ?? 0)}
                onChange={(e) => setValues((s) => ({ ...s, cost: Number(e.target.value) }))}
              />
              {errors.cost ? <div className="text-xs text-destructive">{errors.cost}</div> : null}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
