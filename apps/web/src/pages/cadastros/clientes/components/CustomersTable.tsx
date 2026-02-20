import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { onlyDigits } from "@/shared/br/digits";
import { maskCPF, maskCNPJ, maskPhoneBR } from "@/shared/br/masks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Customer } from "../customers.types";

type Props = {
  rows: Customer[];
  loading: boolean;
  onEdit: (row: Customer) => void;
  onRemove: (row: Customer) => void;
};

export function CustomersTable({ rows, loading, onEdit, onRemove }: Props) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: 90 }}>ID</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead style={{ width: 120 }}>Tipo</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead style={{ width: 140 }}>Status</TableHead>
            <TableHead style={{ width: 180 }} className="text-right">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                Carregando...
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                Nenhum cliente encontrado.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => {
              const active = r.is_active ?? true;
              const docDigits = onlyDigits(r.document ?? "");
              const docMasked =
                (r.person_type === "PJ" || docDigits.length > 11) ? maskCNPJ(docDigits) : maskCPF(docDigits);

              const phoneMasked = r.phone ? maskPhoneBR(r.phone) : "";
              const mobileMasked = r.mobile ? maskPhoneBR(r.mobile) : "";
              return (
                <TableRow key={r.id}>
                  <TableCell>#{r.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.billing_city ? `${r.billing_city}/${r.billing_state ?? ""}` : ""}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{r.person_type ?? "—"}</Badge>
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">{docMasked}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="truncate">{r.email ?? ""}</div>

                    {phoneMasked || mobileMasked ? (
                      <div className="font-mono tabular-nums">
                        {phoneMasked ? <div>{phoneMasked}</div> : null}
                        {mobileMasked ? <div>{mobileMasked}</div> : null}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">—</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {active ? <Badge>Ativo</Badge> : <Badge variant="destructive">Inativo</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(r)}>
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemove(r)}
                        disabled={!active}
                        title={!active ? "Cliente já está inativo" : "Desativar"}
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
