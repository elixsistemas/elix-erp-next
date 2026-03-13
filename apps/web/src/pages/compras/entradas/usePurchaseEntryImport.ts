import { useCallback, useEffect, useState } from "react";
import {
  getPurchaseEntryImport,
  listPurchaseEntryProductsMini,
  listPurchaseEntrySuppliersMini,
} from "./purchase-entry-imports.service";
import type {
  ProductMini,
  PurchaseEntryImportDetails,
  SupplierMini,
} from "./purchase-entry-imports.types";

type State = {
  loading: boolean;
  error: string | null;
  data: PurchaseEntryImportDetails | null;
};

export function usePurchaseEntryImport(id: number) {
  const [state, setState] = useState<State>({
    loading: true,
    error: null,
    data: null,
  });

  const [suppliers, setSuppliers] = useState<SupplierMini[]>([]);
  const [products, setProducts] = useState<ProductMini[]>([]);

  const loadImport = useCallback(async () => {
    if (!id) return;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const data = await getPurchaseEntryImport(id);

      setState({
        loading: false,
        error: null,
        data,
      });
    } catch (err: any) {
      setState({
        loading: false,
        error: err?.message ?? "Erro ao carregar importação",
        data: null,
      });
    }
  }, [id]);

  const loadSuppliers = useCallback(async () => {
    try {
      const result = await listPurchaseEntrySuppliersMini();
      setSuppliers(result ?? []);
    } catch {
      setSuppliers([]);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const result = await listPurchaseEntryProductsMini();
      setProducts(result ?? []);
    } catch {
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    void Promise.all([loadImport(), loadSuppliers(), loadProducts()]);
  }, [loadImport, loadSuppliers, loadProducts]);

  const reload = useCallback(async () => {
    await Promise.all([loadImport(), loadSuppliers(), loadProducts()]);
  }, [loadImport, loadSuppliers, loadProducts]);

  return {
    ...state,
    suppliers,
    products,
    reload,
  };
}