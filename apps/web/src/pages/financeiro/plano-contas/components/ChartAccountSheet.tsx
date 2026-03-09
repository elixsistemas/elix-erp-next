import { useEffect, useMemo, useState } from "react";
import type {
  ChartAccountNode,
  ChartAccountPayload,
} from "../chart-of-accounts.types";
import { chartAccountSchema } from "../chart-of-accounts.schema";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  title: string;
  items: ChartAccountNode[];
  currentId?: number | null;
  initialValues?: Partial<ChartAccountPayload>;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: ChartAccountPayload) => Promise<void> | void;
};

const defaultValues: ChartAccountPayload = {
  parentId: null,
  code: "",
  name: "",
  nature: "asset",
  accountKind: "analytic",
  allowPosting: true,
  isResultAccount: false,
  dreGroup: null,
  active: true,
  sortOrder: 0,
};

function flattenTree(nodes: ChartAccountNode[], level = 0): Array<{ id: number; label: string }> {
  return nodes.flatMap((node) => [
    { id: node.id, label: `${"— ".repeat(level)}${node.code} · ${node.name}` },
    ...flattenTree(node.children ?? [], level + 1),
  ]);
}

export function ChartAccountSheet({
  open,
  mode,
  title,
  items,
  currentId,
  initialValues,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<ChartAccountPayload>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setValues({
      ...defaultValues,
      ...initialValues,
    });
    setErrors({});
  }, [initialValues, open]);

  const parentOptions = useMemo(
    () => flattenTree(items).filter((item) => item.id !== currentId),
    [items, currentId],
  );

  const isResultNature =
    values.nature === "revenue" || values.nature === "expense";

  useEffect(() => {
    if (values.accountKind === "synthetic" && values.allowPosting) {
      setValues((prev) => ({ ...prev, allowPosting: false }));
    }
  }, [values.accountKind, values.allowPosting]);

  useEffect(() => {
    if (!isResultNature) {
      setValues((prev) => ({
        ...prev,
        isResultAccount: false,
        dreGroup: null,
      }));
    }
  }, [isResultNature]);

  function setField<K extends keyof ChartAccountPayload>(
    field: K,
    value: ChartAccountPayload[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = chartAccountSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (typeof path === "string") nextErrors[path] = issue.message;
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
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Conta pai</label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              value={values.parentId ?? ""}
              onChange={(e) =>
                setField("parentId", e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">Raiz</option>
              {parentOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Código</label>
              <input
                value={values.code}
                onChange={(e) => setField("code", e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
              {errors.code && <p className="mt-1 text-xs text-rose-600">{errors.code}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Ordem</label>
              <input
                type="number"
                min={0}
                value={values.sortOrder}
                onChange={(e) => setField("sortOrder", Number(e.target.value || 0))}
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
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Natureza</label>
              <select
                value={values.nature}
                onChange={(e) => setField("nature", e.target.value as ChartAccountPayload["nature"])}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="asset">Ativo</option>
                <option value="liability">Passivo</option>
                <option value="equity">Patrimônio Líquido</option>
                <option value="revenue">Receita</option>
                <option value="expense">Despesa</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Tipo</label>
              <select
                value={values.accountKind}
                onChange={(e) =>
                  setField("accountKind", e.target.value as ChartAccountPayload["accountKind"])
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="synthetic">Sintética</option>
                <option value="analytic">Analítica</option>
              </select>
            </div>
          </div>

          {isResultNature && (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={values.isResultAccount}
                  onChange={(e) => setField("isResultAccount", e.target.checked)}
                />
                Conta de resultado
              </label>

              <div>
                <label className="mb-1 block text-sm font-medium">Grupo DRE</label>
                <select
                  value={values.dreGroup ?? ""}
                  disabled={!values.isResultAccount}
                  onChange={(e) =>
                    setField(
                      "dreGroup",
                      e.target.value
                        ? (e.target.value as ChartAccountPayload["dreGroup"])
                        : null,
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="">Selecione</option>
                  <option value="gross_revenue">Receita Bruta</option>
                  <option value="deductions">Deduções</option>
                  <option value="net_revenue">Receita Líquida</option>
                  <option value="cogs">CMV / Custo</option>
                  <option value="operating_expense">Despesa Operacional</option>
                  <option value="financial_result">Resultado Financeiro</option>
                  <option value="taxes_on_profit">Tributos sobre Lucro</option>
                  <option value="other_operating_result">Outros Resultados</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
              <input
                type="checkbox"
                checked={values.active}
                onChange={(e) => setField("active", e.target.checked)}
              />
              Ativa
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
              <input
                type="checkbox"
                checked={values.allowPosting}
                disabled={values.accountKind === "synthetic"}
                onChange={(e) => setField("allowPosting", e.target.checked)}
              />
              Permite lançamento
            </label>
          </div>

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
              {loading ? "Salvando..." : mode === "create" ? "Criar conta" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}