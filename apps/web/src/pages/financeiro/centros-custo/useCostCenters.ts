import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createCostCenter,
  deleteCostCenter,
  listCostCenters,
  updateCostCenter,
} from "./cost-centers.service";
import type {
  CostCenter,
  CostCenterFormData,
} from "./cost-centers.types";

export function useCostCenters() {
  const [items, setItems] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"1" | "0" | "">("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await listCostCenters({
        q: search,
        active: activeFilter,
      });

      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar centros de custo",
      );
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeItemsCount = useMemo(
    () => items.filter((item) => item.active).length,
    [items],
  );

  async function createItem(data: CostCenterFormData) {
    try {
      setSaving(true);
      await createCostCenter(data);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function updateItem(id: number, data: Partial<CostCenterFormData>) {
    try {
      setSaving(true);
      await updateCostCenter(id, data);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: number) {
    try {
      setSaving(true);
      await deleteCostCenter(id);
      await load();
    } finally {
      setSaving(false);
    }
  }

  return {
    items,
    loading,
    saving,
    error,
    search,
    setSearch,
    activeFilter,
    setActiveFilter,
    activeItemsCount,
    load,
    createItem,
    updateItem,
    deleteItem,
  };
}