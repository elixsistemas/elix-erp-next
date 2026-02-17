import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProductMini } from "../inventory.types";
import { MovementFormSchema, type MovementFormValues } from "../inventory.schema";

type Props = {
  open: boolean;
  saving?: boolean;
  products: ProductMini[];
  presetType?: "IN" | "OUT" | "ADJUST_POS" | "ADJUST_NEG";
  onClose: () => void;
  onSubmit: (values: MovementFormValues) => Promise<void> | void;
};

export function MovementDialog({ open, saving, products, presetType, onClose, onSubmit }: Props) {
  const [values, setValues] = React.useState<MovementFormValues>({
    productId: products[0]?.id ?? 1,
    type: presetType ?? "IN",
    quantity: 1,
    source: "",
    sourceId: undefined,
    note: null,
  });

  React.useEffect(() => {
    if (open) {
      setValues((v) => ({
        ...v,
        productId: v.productId || products[0]?.id || 1,
        type: presetType ?? v.type,
      }));
    }
  }, [open, products, presetType]);


  function set<K extends keyof MovementFormValues>(key: K, val: MovementFormValues[K]) {
    setValues((s) => ({ ...s, [key]: val }));
  }

  async function handleSubmit() {
    const parsed = MovementFormSchema.parse(values);
    await onSubmit(parsed);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova movimentação</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-sm">Produto</div>
            <Select value={String(values.productId)} onValueChange={(v) => set("productId", Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-sm">Tipo</div>

              {presetType ? (
                <div className="rounded-md border px-3 py-2 text-sm bg-muted/20">
                  {presetType === "IN" ? "Entrada" :
                  presetType === "OUT" ? "Saída" :
                  presetType === "ADJUST_POS" ? "Ajuste +" : "Ajuste -"}
                </div>
              ) : (
                <Select value={values.type} onValueChange={(v) => set("type", v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">Entrada</SelectItem>
                    <SelectItem value="OUT">Saída</SelectItem>
                    <SelectItem value="ADJUST_POS">Ajuste +</SelectItem>
                    <SelectItem value="ADJUST_NEG">Ajuste -</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-sm">Quantidade</div>
              <Input
                type="number"
                min={1}
                value={values.quantity}
                onChange={(e) => set("quantity", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm">Observação</div>
            <Input value={values.note ?? ""} onChange={(e) => set("note", e.target.value || null)} placeholder="Opcional" />
          </div>

          <div className="text-xs text-muted-foreground">
            * Origem, motivo e idempotência são preenchidos automaticamente.
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || products.length === 0}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
