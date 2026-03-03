import { useEffect, useMemo, useState } from "react";
import type { PagedResult, ListFiscalQuery, Uom } from "./fiscal.types";
import * as api from "./fiscal.service";

export function useFiscalUom() {
  const [query, setQuery] = useState<ListFiscalQuery>({
    page: 1,
    pageSize: 25,
    active: "1",
  });

  const [data, setData] = useState<PagedResult<Uom> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listUom(query);
      setData(res);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao carregar UOM");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, [query.page, query.pageSize, query.active, query.search]);

  const paging = useMemo(
    () => ({
      page: data?.page ?? query.page ?? 1,
      pageSize: data?.pageSize ?? query.pageSize ?? 25,
      total: data?.total ?? 0,
    }),
    [data, query.page, query.pageSize]
  );

  return { query, setQuery, data, loading, error, reload, paging };
}