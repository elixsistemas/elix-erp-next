// apps/web/src/pages/pedidos/useOrderDetails.ts
import * as React from "react";
import type { BillOrderResult, OrderDetails } from "./orders.types";
import { billOrder, cancelOrder, getOrder } from "./orders.service";

export function useOrderDetails(orderId: number) {
  const [data, setData] = React.useState<OrderDetails | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [billing, setBilling] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);

  const reload = React.useCallback(async () => {
    if (!Number.isFinite(orderId) || orderId <= 0) return;
    setLoading(true);
    try {
      const d = await getOrder(orderId);
      setData(d);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  async function bill(): Promise<BillOrderResult> {
    setBilling(true);
    try {
      return await billOrder(orderId);
    } finally {
      setBilling(false);
    }
  }

  async function cancel() {
    setCancelling(true);
    try {
      return await cancelOrder(orderId);
    } finally {
      setCancelling(false);
    }
  }

  return {
    data,
    loading,
    reload,
    billing,
    cancelling,
    bill,
    cancel,
  };
}
