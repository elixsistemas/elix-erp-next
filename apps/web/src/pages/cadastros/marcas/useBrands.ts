import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createBrand,
  deleteBrand,
  listBrands,
  updateBrand,
} from "./brands.service";
import type {
  Brand,
  BrandFormData,
} from "./brands.types";

export function useBrands() {
  const [items, setItems] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"1" | "0" | "">("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await listBrands({
        q: search,
        active: activeFilter,
      });

      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar marcas",
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

  async function createItem(data: BrandFormData) {
    try {
      setSaving(true);
      await createBrand(data);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function updateItem(id: number, data: Partial<BrandFormData>) {
    try {
      setSaving(true);
      await updateBrand(id, data);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: number) {
    try {
      setSaving(true);
      await deleteBrand(id);
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