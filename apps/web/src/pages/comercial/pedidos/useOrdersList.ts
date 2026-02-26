import * as React from "react";
import { fetchOrders } from "./orders.service";
import type { OrderRow } from "./orders.types";

export function useOrdersList() {
  const [rows,    setRows]    = React.useState<OrderRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [query,   setQuery]   = React.useState("");
  const [status,  setStatus]  = React.useState<string>("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOrders({
        q:      query  || undefined,
        status: status || undefined,
        limit:  100,
      });
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, [query, status]);

  React.useEffect(() => { load(); }, [load]);

  return { rows, loading, query, setQuery, status, setStatus, reload: load };
}
