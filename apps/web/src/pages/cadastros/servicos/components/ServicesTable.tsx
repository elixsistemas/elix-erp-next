import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Service } from "../services.types";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type Props = {
  rows: Service[];
  loading: boolean;
  onEdit: (row: Service) => void;
  onRemove: (row: Service) => void;
};

export function ServicesTable({
  rows,
  loading,
  onEdit,
  onRemove,
}: Props) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Serviço</TableHead>
            <TableHead className="w-[140px]">Preço</TableHead>
            <TableHead className="w-[140px]">Custo</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[180px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                Carregando...
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                Nenhum serviço encontrado.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => {
              const active = r.active ?? true;

              return (
                <TableRow key={r.id}>
                  <TableCell className="font-mono">#{r.id}</TableCell>

                  <TableCell>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.sku ? `SKU: ${r.sku}` : "—"}
                    </div>
                  </TableCell>

                  <TableCell>{brl.format(Number(r.price ?? 0))}</TableCell>
                  <TableCell>{brl.format(Number(r.cost ?? 0))}</TableCell>

                  <TableCell>
                    <Badge variant={active ? "default" : "outline"}>
                      {active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(r)}
                      >
                        Editar
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onRemove(r)}
                        disabled={!active}
                        title={
                          !active
                            ? "Serviço já está inativo"
                            : "Desativar"
                        }
                      >
                        Desativar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}