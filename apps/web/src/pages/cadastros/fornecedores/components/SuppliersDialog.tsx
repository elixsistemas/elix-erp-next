import * as React from "react";
import type { Supplier } from "../suppliers.types";
import { supplierFormSchema, type SupplierFormValues } from "../suppliers.schema";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Supplier | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (values: SupplierFormValues) => void;
};

export function SuppliersDialog({
  open,
  mode,
  initial,
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = React.useState<SupplierFormValues>({
    name: "",
    document: "", // obrigatório: inicia vazio
    email: null,
    phone: null,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!open) return;
    setErrors({});

    if (mode === "edit" && initial) {
      setValues({
        name: initial.name ?? "",
        document: initial.document ?? "", // se vier null, vira ""
        email: initial.email ?? null,
        phone: initial.phone ?? null,
      });
    } else {
      setValues({ name: "", document: "", email: null, phone: null });
    }
  }, [open, mode, initial]);

  function validate(next: SupplierFormValues) {
    const parsed = supplierFormSchema.safeParse(next);
    if (parsed.success) {
      setErrors({});
      return parsed.data;
    }
    const map: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path?.[0] ?? "form");
      if (!map[key]) map[key] = issue.message;
    }
    setErrors(map);
    return null;
  }

  function setField<K extends keyof SupplierFormValues>(key: K, value: SupplierFormValues[K]) {
    setValues((s) => ({ ...s, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const copy = { ...prev };
      delete copy[key as string];
      return copy;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = validate(values);
    if (!parsed) return;
    onSubmit(parsed);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Novo cliente" : "Editar cliente"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nome</label>
            <Input
              value={values.name}
              onChange={(e) => setField("name", e.target.value)}
              disabled={saving}
              autoFocus
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">CPF/CNPJ</label>
            <Input
              value={values.document}
              onChange={(e) => setField("document", e.target.value)}
              placeholder="Somente números ou com máscara"
              inputMode="numeric"
              disabled={saving}
            />
            {errors.document && <p className="text-sm text-red-600">{errors.document}</p>}
            <p className="text-xs text-muted-foreground">
              Obrigatório para fiscal e cobrança (boleto).
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">E-mail (opcional)</label>
              <Input
                value={values.email ?? ""}
                onChange={(e) => setField("email", e.target.value || null)}
                disabled={saving}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Telefone (opcional)</label>
              <Input
                value={values.phone ?? ""}
                onChange={(e) => setField("phone", e.target.value || null)}
                disabled={saving}
              />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>

          {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

          <DialogFooter className="gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
