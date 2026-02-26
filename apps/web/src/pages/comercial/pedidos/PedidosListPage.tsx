import { useNavigate } from "react-router-dom";
import { OrdersToolbar } from "./components/OrdersToolbar";
import { OrdersTable }   from "./components/OrdersTable";
import { useOrdersList } from "./useOrdersList";

export default function PedidosListPage() {
  const nav = useNavigate();
  const { rows, loading, query, setQuery, status, setStatus, reload } = useOrdersList();

  return (
    <div className="p-6 space-y-4">
      <OrdersToolbar
        query={query}    onQuery={setQuery}
        status={status}  onStatus={setStatus}
        loading={loading} onReload={reload}
        onCreate={() => nav("/comercial/pedidos/new")}
      />
      <div className="rounded-lg border bg-card">
        <OrdersTable rows={rows} loading={loading} onOpen={id => nav(`/comercial/pedidos/${id}`)} />
      </div>
    </div>
  );
}
