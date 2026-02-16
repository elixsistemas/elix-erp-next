// components/AccountsTable.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FinanceAccount } from "../dashboard.types";
import { formatBRL } from "../dashboard.utils";

export function AccountsTable(props: { accounts: FinanceAccount[]; totalBalance: number }) {
  const { accounts, totalBalance } = props;

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle>Posição de Caixa por Conta</CardTitle>
        <CardDescription>Saldos calculados com base em eventos financeiros auditáveis</CardDescription>
      </CardHeader>
      <CardContent>
        {!accounts.length ? (
          <div className="py-10 text-center text-slate-500">Nenhuma conta encontrada.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conta</TableHead>
                <TableHead>Banco</TableHead>
                <TableHead>Agência</TableHead>
                <TableHead>Número</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {accounts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.bank_code ?? "-"}</TableCell>
                  <TableCell>{a.agency ?? "-"}</TableCell>
                  <TableCell>
                    {(a.account ?? "-")}
                    {a.account_digit ? `-${a.account_digit}` : ""}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      Number(a.balance) >= 0 ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {formatBRL(a.balance)}
                  </TableCell>
                </TableRow>
              ))}

              <TableRow>
                <TableCell colSpan={4} className="text-right font-semibold">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatBRL(totalBalance)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
