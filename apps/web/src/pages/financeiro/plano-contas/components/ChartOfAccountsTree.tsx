import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Plus, Power, Trash2 } from "lucide-react";
import type { ChartAccountNode } from "../chart-of-accounts.types";

type Props = {
  items: ChartAccountNode[];
  onCreateChild: (item: ChartAccountNode) => void;
  onEdit: (item: ChartAccountNode) => void;
  onToggleStatus: (item: ChartAccountNode) => void;
  onDelete: (item: ChartAccountNode) => void;
};

function natureLabel(value: string) {
  const map: Record<string, string> = {
    asset: "Ativo",
    liability: "Passivo",
    equity: "Patrimônio Líquido",
    revenue: "Receita",
    expense: "Despesa",
  };
  return map[value] ?? value;
}

function kindLabel(value: string) {
  return value === "synthetic" ? "Sintética" : "Analítica";
}

function dreLabel(value: string | null) {
  const map: Record<string, string> = {
    gross_revenue: "Receita Bruta",
    deductions: "Deduções",
    net_revenue: "Receita Líquida",
    cogs: "CMV / Custo",
    operating_expense: "Despesa Operacional",
    financial_result: "Resultado Financeiro",
    taxes_on_profit: "Tributos sobre Lucro",
    other_operating_result: "Outros Resultados",
  };
  return value ? map[value] ?? value : "—";
}

type RowProps = {
  item: ChartAccountNode;
  level: number;
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  onCreateChild: (item: ChartAccountNode) => void;
  onEdit: (item: ChartAccountNode) => void;
  onToggleStatus: (item: ChartAccountNode) => void;
  onDelete: (item: ChartAccountNode) => void;
};

function TreeRow({
  item,
  level,
  expandedIds,
  onToggleExpand,
  onCreateChild,
  onEdit,
  onToggleStatus,
  onDelete,
}: RowProps) {
  const hasChildren = item.children?.length > 0;
  const expanded = expandedIds.has(item.id);

  return (
    <div className="space-y-2">
      <div
        className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        style={{ marginLeft: `${level * 18}px` }}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => hasChildren && onToggleExpand(item.id)}
                disabled={!hasChildren}
                className="rounded p-1 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
              >
                {hasChildren ? (
                  expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                ) : (
                  <span className="inline-block h-4 w-4" />
                )}
              </button>

              <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs dark:bg-slate-800">
                {item.code}
              </span>

              <span className="truncate text-sm font-semibold md:text-base">
                {item.name}
              </span>

              {!item.active && (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  Inativa
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="rounded-full border border-slate-200 px-2 py-0.5 dark:border-slate-700">
                {natureLabel(item.nature)}
              </span>
              <span className="rounded-full border border-slate-200 px-2 py-0.5 dark:border-slate-700">
                {kindLabel(item.account_kind)}
              </span>
              <span className="rounded-full border border-slate-200 px-2 py-0.5 dark:border-slate-700">
                {item.allow_posting ? "Lançável" : "Estrutural"}
              </span>
              <span className="rounded-full border border-slate-200 px-2 py-0.5 dark:border-slate-700">
                DRE: {dreLabel(item.dre_group)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onCreateChild(item)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <Plus size={16} />
              Filho
            </button>

            <button
              type="button"
              onClick={() => onEdit(item)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <Pencil size={16} />
              Editar
            </button>

            <button
              type="button"
              onClick={() => onToggleStatus(item)}
              className="inline-flex items-center gap-1 rounded-lg border border-amber-300 px-3 py-2 text-sm hover:bg-amber-50 dark:border-amber-700 dark:hover:bg-amber-950"
            >
              <Power size={16} />
              {item.active ? "Inativar" : "Ativar"}
            </button>

            <button
              type="button"
              onClick={() => onDelete(item)}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950"
            >
              <Trash2 size={16} />
              Excluir
            </button>
          </div>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="space-y-2">
          {item.children.map((child) => (
            <TreeRow
              key={child.id}
              item={child}
              level={level + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onCreateChild={onCreateChild}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ChartOfAccountsTree({
  items,
  onCreateChild,
  onEdit,
  onToggleStatus,
  onDelete,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const allIds = useMemo(() => {
    const ids: number[] = [];
    const walk = (nodes: ChartAccountNode[]) => {
      for (const node of nodes) {
        ids.push(node.id);
        if (node.children?.length) walk(node.children);
      }
    };
    walk(items);
    return ids;
  }, [items]);

  function toggleExpand(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setExpandedIds(new Set(allIds))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Expandir tudo
        </button>
        <button
          type="button"
          onClick={() => setExpandedIds(new Set())}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Recolher tudo
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <TreeRow
            key={item.id}
            item={item}
            level={0}
            expandedIds={expandedIds}
            onToggleExpand={toggleExpand}
            onCreateChild={onCreateChild}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}