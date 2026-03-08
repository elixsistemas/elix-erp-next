import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CarrierVehicle } from "../carrierVehicles.types";

type Props = {
  rows: CarrierVehicle[];
  loading: boolean;
  onEdit: (row: CarrierVehicle) => void;
  onRemove: (row: CarrierVehicle) => void;
};

export function CarrierVehiclesTable(props: Props) {
  if (props.loading) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!props.rows.length) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhum veículo encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr className="text-left">
            <th className="px-4 py-3">Placa</th>
            <th className="px-4 py-3">Transportadora</th>
            <th className="px-4 py-3">Tipo / Carroceria</th>
            <th className="px-4 py-3">Modelo</th>
            <th className="px-4 py-3">UF</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr key={row.id} className="border-t">
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className="font-medium">{row.plate}</span>
                  <div className="text-xs text-muted-foreground">
                    {row.secondary_plate || "-"}
                  </div>
                </div>
              </td>

              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span>{row.carrier_trade_name || row.carrier_legal_name}</span>
                  <div className="text-xs text-muted-foreground">
                    {row.carrier_trade_name ? row.carrier_legal_name : "-"}
                  </div>
                </div>
              </td>

              <td className="px-4 py-3">
                {[row.vehicle_type, row.body_type].filter(Boolean).join(" • ") || "-"}
              </td>

              <td className="px-4 py-3">{row.brand_model || "-"}</td>

              <td className="px-4 py-3">{row.state || "-"}</td>

              <td className="px-4 py-3">
                <Badge variant={row.active ? "default" : "secondary"}>
                  {row.active ? "Ativo" : "Inativo"}
                </Badge>
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => props.onEdit(row)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => props.onRemove(row)}>
                    Excluir
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}