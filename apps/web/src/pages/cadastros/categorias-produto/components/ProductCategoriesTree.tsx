import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ProductCategoryNode } from "../product-categories.types";

type Props = {
  items: ProductCategoryNode[];
  onCreateChild: (item: ProductCategoryNode) => void;
  onEdit: (item: ProductCategoryNode) => void;
  onDelete: (item: ProductCategoryNode) => void;
};

type RowProps = {
  item: ProductCategoryNode;
  level: number;
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  onCreateChild: (item: ProductCategoryNode) => void;
  onEdit: (item: ProductCategoryNode) => void;
  onDelete: (item: ProductCategoryNode) => void;
};

function TreeRow({
  item,
  level,
  expandedIds,
  onToggleExpand,
  onCreateChild,
  onEdit,
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
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onCreateChild(item)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Subcategoria
            </button>

            <button
              type="button"
              onClick={() => onEdit(item)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() => onDelete(item)}
              className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950"
            >
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
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductCategoriesTree({
  items,
  onCreateChild,
  onEdit,
  onDelete,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const allIds = useMemo(() => {
    const ids: number[] = [];
    const walk = (nodes: ProductCategoryNode[]) => {
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
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}