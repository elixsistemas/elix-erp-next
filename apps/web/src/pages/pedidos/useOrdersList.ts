// apps/web/src/pages/pedidos/useOrdersList.ts
import * as React from "react";
import type { OrderRow, OrderStatus } from "./orders.types";
import { listOrders } from "./orders.service";

export function useOrdersList() {
  const [rows, setRows] = React.useState<OrderRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [from, setFrom] = React.useState<string>("");
  const [to, setTo] = React.useState<string>("");
  const [status, setStatus] = React.useState<OrderStatus | "ALL">("ALL");
  const [customerId, setCustomerId] = React.useState<number | "">("");

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listOrders({
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
