import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, RefreshCw, Search } from "lucide-react";
import type { CarrierOption } from "../carrierVehicles.types";

type Props = {
  q: string;
  onChangeQ: (value: string) => void;
  carrierIdFilter: string;
  onChangeCarrierIdFilter: (value: string) => void;
  carrierOptions: CarrierOption[];
  showInactive: boolean;
  onToggleInactive: (value: boolean) => void;
  loading: boolean;
  onReload: () => void;
  onCreate: () => void;
};

export function CarrierVehiclesToolbar(props: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={props.q}
            onChange={(e) => props.onChangeQ(e.target.value)}
            placeholder="Buscar por placa, modelo, RNTRC, transportadora..."
            className="pl-9"
          />
        </div>

        <Select
          value={props.carrierIdFilter || "all"}
          onValueChange={(value) =>
            props.onChangeCarrierIdFilter(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-full md:w-[280px]">
            <SelectValue placeholder="Transportadora" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as transportadoras</SelectItem>
            {props.carrierOptions.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>
                {item.trade_name || item.legal_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-3 rounded-md border px-3 py-2">
          <Switch
            checked={props.showInactive}
            onCheckedChange={props.onToggleInactive}
          />
          <span className="text-sm">Mostrar inativos</span>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={props.onReload}
          disabled={props.loading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      <Button type="button" onClick={props.onCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Novo veículo
      </Button>
    </div>
  );
}