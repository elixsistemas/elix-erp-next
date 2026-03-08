import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Carrier } from "../carriers.types";

type Props = {
  rows: Carrier[];
  loading: boolean;
  onEdit: (row: Carrier) => void;
  onRemove: (row: Carrier) => void;
};

export function CarriersTable(props: Props) {
  if (props.loading) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!props.rows.length) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        Nenhuma transportadora encontrada.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr className="text-left">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Transportadora</th>
            <th className="px-4 py-3">Documento</th>
            <th className="px-4 py-3">Contato</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>

        <tbody>
          {props.rows.map((row) => (
            <tr key={row.id} className="border-t">
              <td className="px-4 py-3 font-medium">#{row.id}</td>

              <td className="px-4 py-3">
                <div className="font-medium">{row.name}</div>
                {(row.city || row.state) && (
                  <div className="text-xs text-muted-foreground">
                    {[row.city, row.state].filter(Boolean).join("/")}
                  </div>
                )}
              </td>

              <td className="px-4 py-3">
                <div>{row.document || "-"}</div>
                {row.rntrc && (
                  <div className="text-xs text-muted-foreground">
                    RNTRC: {row.rntrc}
                  </div>
                )}
              </td>

              <td className="px-4 py-3">
                <div>{row.email || "-"}</div>
                {(row.phone || row.contact_name) && (
                  <div className="text-xs text-muted-foreground">
                    {[row.phone, row.contact_name].filter(Boolean).join(" • ")}
                  </div>
                )}
              </td>

              <td className="px-4 py-3">
                <Badge variant={row.active ? "default" : "secondary"}>
                  {row.active ? "Ativo" : "Inativo"}
                </Badge>
              </td>

              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
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