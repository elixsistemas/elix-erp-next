import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createProductCategory,
  deleteProductCategory,
  listProductCategoriesTree,
  updateProductCategory,
} from "./product-categories.service";
import type {
  ProductCategoryFormData,
  ProductCategoryNode,
} from "./product-categories.types";

function filterTree(nodes: ProductCategoryNode[], term: string): ProductCategoryNode[] {
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
    .filter(Boolean) as ProductCategoryNode[];
}

export function useProductCategories() {
  const [items, setItems] = useState<ProductCategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listProductCategoriesTree();
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar categorias de produto",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredItems = useMemo(() => filterTree(items, search), [items, search]);

  async function createItem(data: ProductCategoryFormData) {
    try {
      setSaving(true);
      await createProductCategory(data);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function updateItem(id: number, data: Partial<ProductCategoryFormData>) {
    try {
      setSaving(true);
      await updateProductCategory(id, data);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: number) {
    try {
      setSaving(true);
      await deleteProductCategory(id);
      await load();
    } finally {
      setSaving(false);
    }
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
    deleteItem,
  };
}