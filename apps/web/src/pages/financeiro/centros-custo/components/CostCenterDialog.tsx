import { useEffect, useState } from "react";
import { costCenterFormSchema } from "../cost-centers.schema";
import type {
  CostCenter,
  CostCenterFormData,
} from "../cost-centers.types";

type Props = {
  open: boolean;
  loading?: boolean;
  item?: CostCenter | null;
  onClose: () => void;
  onSubmit: (data: CostCenterFormData) => Promise<void> | void;
};

const defaultValues: CostCenterFormData = {
  code: "",
  name: "",
  active: true,
  sortOrder: 0,
};

export function CostCenterDialog({
  open,
  loading,
  item,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<CostCenterFormData>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setValues({
        code: item.code,
        name: item.name,
        active: item.active,
        sortOrder: item.sort_order,
      });
    } else {
      setValues(defaultValues);
    }
    setErrors({});
  }, [item, open]);

  function setField<K extends keyof CostCenterFormData>(
    field: K,
    value: CostCenterFormData[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = costCenterFormSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") nextErrors[field] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await onSubmit(parsed.data);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            {item ? "Editar centro de custo" : "Novo centro de custo"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Código</label>
              <input
                value={values.code}
                onChange={(e) => setField("code", e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
              {errors.code && (
                <p className="mt-1 text-xs text-rose-600">{errors.code}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Ordem</label>
              <input
                type="number"
                min={0}
                value={values.sortOrder}
                onChange={(e) =>
                  setField("sortOrder", Number(e.target.value || 0))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Nome</label>
            <input
              value={values.name}
              onChange={(e) => setField("name", e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
            )}
          </div>

          <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
            <input
              type="checkbox"
              checked={values.active}
              onChange={(e) => setField("active", e.target.checked)}
            />
            Ativo
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}