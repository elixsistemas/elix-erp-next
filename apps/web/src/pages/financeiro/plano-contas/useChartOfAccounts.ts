import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listChartAccountsTree,
  createChartAccount,
  updateChartAccount,
  updateChartAccountStatus,
  removeChartAccount,
} from "./chart-of-accounts.service";
import type {
  ChartAccountNode,
  ChartAccountPayload,
} from "./chart-of-accounts.types";

function filterTree(nodes: ChartAccountNode[], term: string): ChartAccountNode[] {
  const q = term.trim().toLowerCase();
  if (!q) return nodes;

  return nodes
    .map((node) => {
      const children = filterTree(node.children ?? [], q);
      const selfMatch =
        node.code.toLowerCase().includes(q) ||
        node.name.toLowerCase().includes(q);

      if (selfMatch || children.length > 0) {
        return { ...node, children };
      }

      return null;
    })
    .filter(Boolean) as ChartAccountNode[];
}

export function useChartOfAccounts() {
  const [items, setItems] = useState<ChartAccountNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listChartAccountsTree();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar plano de contas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredItems = useMemo(() => filterTree(items, search), [items, search]);

  async function createItem(payload: ChartAccountPayload) {
    try {
      setSaving(true);
      await createChartAccount(payload);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function updateItem(id: number, payload: ChartAccountPayload) {
    try {
      setSaving(true);
      await updateChartAccount(id, payload);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(id: number, active: boolean) {
    await updateChartAccountStatus(id, active);
    await load();
  }

  async function removeItem(id: number) {
    await removeChartAccount(id);
    await load();
  }

  return {
    items,
    filteredItems,
    loading,
    saving,
    error,
    search,
    setSearch,
    load,
    createItem,
    updateItem,
    toggleStatus,
    removeItem,
  };
}