import { useCallback, useEffect, useState } from "react";
import {
  getPurchaseEntryImportById,
  listProductsMini,
  listSuppliersMini,
} from "./purchase-entry-imports.service";
import type {
  ProductMini,
  PurchaseEntryImportDetails,
  SupplierMini,
} from "./purchase-entry-imports.types";

export function usePurchaseEntryImport(id?: number) {
  const [data, setData] = useState<PurchaseEntryImportDetails | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierMini[]>([]);
  const [products, setProducts] = useState<ProductMini[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [details, supplierList, productList] = await Promise.all([
        getPurchaseEntryImportById(id),
        listSuppliersMini(),
        listProductsMini(),
      ]);
      setData(details);
      setSuppliers(supplierList);
      setProducts(productList);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    suppliers,
    products,
    loading,
    reload: load,
  };
}