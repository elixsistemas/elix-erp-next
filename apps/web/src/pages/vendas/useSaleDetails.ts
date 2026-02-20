import * as React from "react";
import { getSale, listSaleFiscal } from "./sales.service";
import type { SaleDetails, FiscalDoc } from "./sales.types";

export function useSaleDetails(saleId: number) {
  const [data, setData] = React.useState<SaleDetails | null>(null);
  const [fiscal, setFiscal] = React.useState<{ documents: FiscalDoc[] } | null>(null);
  const [loading, setLoading] = React.useState(false);

  const reload = React.useCallback(async () => {
    if (!Number.isFinite(saleId) || saleId <= 0) return;
    setLoading(true);
    try {
      const [s, f] = await Promise.all([getSale(saleId), listSaleFiscal(saleId)]);
      setData(s);
      setFiscal(f);
    } finally {
      setLoading(false);
    }
  }, [saleId]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  return { data, fiscal, loading, reload };
}
