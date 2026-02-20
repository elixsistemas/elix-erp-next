// apps/web/src/pages/pedidos/components/OrdersToolbar.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OrderStatus } from "../orders.types";

type Props = {
  from: string;
  to: string;
  status: OrderStatus | "ALL";
  customerId: number | "";

  onChangeFrom: (v: string) => void;
  onChangeTo: (v: string) => void;
  onChangeStatus: (v: OrderStatus | "ALL") => void;
  onChangeCustomerId: (v: number | "") => void;

  onReload: () => void;
};

export function OrdersToolbar({
  from, to, status, customerId,
  onChangeFrom, onChangeTo, onChangeStatus, onChangeCustomerId,
  onReload,
}: Props) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="grid gap-1">
          <div className="text-xs text-muted-foreground">De</div>
          <Input type="date" value={from} onChange={(e) => onChangeFrom(e.target.value)} className="w-full sm:w-44" />
        </div>

        <div className="grid gap-1">
          <div className="text-xs text-muted-foreground">Até</div>
          <Input type="date" value={to} onChange={(e) => onChangeTo(e.target.value)} className="w-full sm:w-44" />
        </div>

        <div className="grid gap-1">
          <div className="text-xs text-muted-foreground">Cliente (ID)</div>
          <Input
            inputMode="numeric"
            value={customerId === "" ? "" : String(customerId)}
            onChange={(e) => onChangeCustomerId(e.target.value ? Number(e.target.value) : "")}
            placeholder="Ex: 1"
            className="w-full sm:w-40"
          />
        </div>

        <div className="grid gap-1">
          <div className="text-xs text-muted-foreground">Status</div>
          <Select value={status} onValueChange={(v) => onChangeStatus(v as any)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="billed">Faturado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={onReload}>
          Recarregar
        </Button>
      </div>
    </div>
  );
}
