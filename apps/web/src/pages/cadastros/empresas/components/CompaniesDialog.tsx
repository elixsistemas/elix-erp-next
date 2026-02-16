import * as React from "react";
import type { Company } from "../companies.types";
import { companyFormSchema, type CompanyFormValues } from "../companies.schema";

// Troque pelos seus componentes reais (shadcn / etc)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Company | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (values: CompanyFormValues) => void;
};

export function CompaniesDialog({
  open,
  mode,
  initial,
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = React.useState<CompanyFormValues>({
    name: "",
    cnpj: null,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Sempre que abrir o dialog, hidrata campos conforme modo
  React.useEffect(() => {
    if (!open) return;

    setErrors({});

    if (mode === "edit" && initial) {
      setValues({
        name: initial.name ?? "",
        cnpj: initial.cnpj ?? null,
      });
    } else {
      setValues({ name: "", cnpj: null });
    }
  }, [open, mode, initial]);

  function validate(next: CompanyFormValues): CompanyFormValues | null {
    const parsed = companyFormSchema.safeParse(next);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = validate(values);
    if (!parsed) return;
    onSubmit(parsed);
  }

  function setField<K extends keyof CompanyFormValues>(
    key: K,
    value: CompanyFormValues[K]
  ) {
    setValues((s) => ({ ...s, [key]: value }));
    // limpa erro assim que o usuário mexe no campo
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const copy = { ...prev };
      delete copy[key as string];
      return copy;
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nova empresa" : "Editar empresa"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nome</label>
            <Input
              value={values.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Ex: Elix Sistemas"
              disabled={saving}
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">CNPJ (opcional)</label>
            <Input
              value={values.cnpj ?? ""}
              onChange={(e) => setField("cnpj", e.target.value || null)}
              placeholder="00.000.000/0000-00"
              disabled={saving}
              inputMode="numeric"
            />
            {errors.cnpj && (
              <p className="text-sm text-red-600">{errors.cnpj}</p>
            )}
          </div>

          {errors.form && (
            <p className="text-sm text-red-600">{errors.form}</p>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={saving}
            >
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
