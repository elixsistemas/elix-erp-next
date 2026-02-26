import * as React from "react";
import { fetchOrder, createOrder, updateOrder, confirmOrder, cancelOrder } from "./orders.service";
import type { OrderRow, OrderItemRow, OrderCreate, OrderUpdate } from "./orders.types";
import { toast } from "sonner";

export function useOrderDetails(id: number | null) {
  const [order,   setOrder]   = React.useState<OrderRow | null>(null);
  const [items,   setItems]   = React.useState<OrderItemRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving,  setSaving]  = React.useState(false);

  const load = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchOrder(id);
      setOrder(data.order);
      setItems(data.items);
    } catch {
      toast.error("Erro ao carregar pedido");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => { load(); }, [load]);

  async function save(body: OrderCreate | OrderUpdate, isNew: boolean) {
    setSaving(true);
    try {
      const result = isNew
        ? await createOrder(body as OrderCreate)
        : await updateOrder(id!, body as OrderUpdate);
      setOrder(result.order);
      setItems(result.items);
      toast.success(isNew ? "Pedido criado!" : "Pedido salvo!");
      return result;
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function confirm() {
    if (!id) return;
    setSaving(true);
    try {
      await confirmOrder(id);
      await load();
      toast.success("Pedido confirmado!");
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao confirmar");
    } finally {
      setSaving(false);
    }
  }

  async function cancel() {
    if (!id) return;
    setSaving(true);
    try {
      await cancelOrder(id);
      await load();
      toast.success("Pedido cancelado.");
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao cancelar");
    } finally {
      setSaving(false);
    }
  }

  return { order, items, loading, saving, load, save, confirm, cancel };
}
