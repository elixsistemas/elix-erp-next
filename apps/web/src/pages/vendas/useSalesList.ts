import * as React from "react";
import type { SaleRow, SaleStatus } from "./sales.types";
import { listSales } from "./sales.service";

export function useSalesList() {
  const [rows, setRows] = React.useState<SaleRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [from, setFrom] = React.useState<string>("");
  const [to, setTo] = React.useState<string>("");
  const [status, setStatus] = React.useState<SaleStatus | "ALL">("ALL");
  const [customerId, setCustomerId] = React.useState<number | "">("");

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSales({
        from: from || undefined,
        to: to || undefined,
        status: status === "ALL" ? undefined : status,
        customerId: customerId === "" ? undefined : Number(customerId),
      });
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, [from, to, status, customerId]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  return {
    rows,
    loading,
    reload,

    from,
    setFrom,
    to,
    setTo,
    status,
    setStatus,
    customerId,
    setCustomerId,
  };
}
